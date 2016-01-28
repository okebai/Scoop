using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Octokit;
using Scoop.Core.BackgroundTasks.Interfaces;
using Scoop.Core.Caching;
using Scoop.Core.Configuration;
using Semver;

namespace Scoop.Core.BackgroundTasks
{
    public class AutoUpdateTask : BackgroundTask<IBackgroundTaskListener<BackgroundTaskResult>, BackgroundTaskResult>
    {
        protected override int HistoryMaxItemCount() { return BackgroundTaskConfiguration.AutoUpdateHistoryMaxItemCount; }
        protected override TimeSpan Interval() { return BackgroundTaskConfiguration.AutoUpdateInterval; }
        private readonly GitHubClient _gitHubClient;
        public override string Name => "AutoUpdateTask";
        public override string FriendlyName => "Auto update";
        public override Guid Guid { get; } = Guid.ParseExact("c5036654798b4437b7d4ef3ded26fe12", "N");

        public AutoUpdateTask(CacheHandler cacheHandler, BackgroundTaskConfiguration backgroundTaskConfiguration) 
            : base(cacheHandler, null, backgroundTaskConfiguration)
        {
            _gitHubClient = new GitHubClient(new ProductHeaderValue("Scoop.Service-UpdateCheck"));
        }

        public override async Task Execute(object state)
        {
            if (!IsEnabled())
                return;

            var currentversion = ParseVersionFromAssembly(GetType().Assembly);
            if (currentversion.Major <= 0)
                return;

            var latestRelease = await GetLatestRelease();
            var latestVersion = ParseVersionFromRelease(latestRelease);
            if (latestVersion.Major > 0 && latestVersion > currentversion)
            {
                var asset = await GetUpdateAsset(latestRelease);
                if (asset != null)
                {
                    var updateInstallerPath = await DownloadAsset(asset);

                    StartInstallProcess(updateInstallerPath, currentversion, latestVersion);
                }
            }
        }

        private bool IsEnabled()
        {
            var setting = ConfigurationManager.AppSettings.Get("BackgroundTask.AutoUpdate.Enabled");
            return setting != null && setting.Equals("true", StringComparison.OrdinalIgnoreCase);
        }

        private void StartInstallProcess(string updateInstallerPath, SemVersion currentversion, SemVersion latestVersion)
        {
            var logFileName = $"scoop.service-autoupdate-{DateTime.Now.ToString("yyyyMMddTHHmmss")}-v{currentversion}to{latestVersion}.log";
            var logDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, ConfigurationManager.AppSettings.Get("BackgroundTask.AutoUpdate.LogDirectory"));
            if (!Directory.Exists(logDirectory))
                Directory.CreateDirectory(logDirectory);

            var logPath = Path.Combine(logDirectory, logFileName);

            var msiExecPath = Path.Combine(Environment.SystemDirectory, "msiexec.exe");
            var msiExecArguments = $@"/i ""{updateInstallerPath}"" /passive /l* ""{logPath}""";

            Process.Start(new ProcessStartInfo(msiExecPath, msiExecArguments));
        }

        private async Task<Release> GetLatestRelease()
        {
            var releases = await _gitHubClient.Release.GetAll(
                ConfigurationManager.AppSettings.Get("BackgroundTask.AutoUpdate.GitHubRepositoryOwner"),
                ConfigurationManager.AppSettings.Get("BackgroundTask.AutoUpdate.GitHubRepositoryName"));

            return releases.OrderByDescending(ParseVersionFromRelease).FirstOrDefault();
        }

        private SemVersion ParseVersionFromAssembly(Assembly assembly)
        {
            var assemblyVersion = assembly.GetName().Version;

            return new SemVersion(assemblyVersion.Major, assemblyVersion.Minor, assemblyVersion.Build, build: assemblyVersion.Revision.ToString());
        }

        private SemVersion ParseVersionFromRelease(Release release)
        {
            if (release.TagName == null)
                return null;

            var split = release.TagName.Split('-');
            if (split.Length < 2 || split[1] == null)
                return null;

            SemVersion version;
            SemVersion.TryParse(split[1].TrimStart('v'), out version);

            return version;
        }

        private async Task<ReleaseAsset> GetUpdateAsset(Release release)
        {
            var assets = await _gitHubClient.Release.GetAllAssets(
                ConfigurationManager.AppSettings.Get("BackgroundTask.AutoUpdate.GitHubRepositoryOwner"),
                ConfigurationManager.AppSettings.Get("BackgroundTask.AutoUpdate.GitHubRepositoryName"),
                release.Id);

            return assets.FirstOrDefault(a => a.Name.StartsWith("Scoop.Service.Installer"));
        }

        private async Task<string> DownloadAsset(ReleaseAsset asset)
        {
            var updateDownloadDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "updates");
            if (!Directory.Exists(updateDownloadDirectory))
                Directory.CreateDirectory(updateDownloadDirectory);

            var fileName = asset.Name;
            var updateInstallerPath = Path.Combine(updateDownloadDirectory, fileName);

            using (var httpClient = new HttpClient())
            {
                var requestStream = await httpClient.GetStreamAsync(asset.BrowserDownloadUrl);

                using (var fileStream = File.Create(updateInstallerPath))
                {
                    await requestStream.CopyToAsync(fileStream);
                }
            }

            return updateInstallerPath;
        }
    }
}