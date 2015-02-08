using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Schema;
using Octokit;
using Scoop.Core.BackgroundTasks.Interfaces;
using Semver;

namespace Scoop.Core.BackgroundTasks
{
    public class AutoUpdateTask : BackgroundTask
    {
        private static readonly Lazy<AutoUpdateTask> _instance = new Lazy<AutoUpdateTask>(() => new AutoUpdateTask());
        public static AutoUpdateTask Instance { get { return _instance.Value; } }
        private readonly GitHubClient _gitHubClient;

        private const string _repositoryOwner = "okebai";
        private const string _repostoryName = "Scoop";

        private AutoUpdateTask()
            : base(TimeSpan.FromMinutes(5))
        {
            _gitHubClient = new GitHubClient(new ProductHeaderValue("Scoop.Service-UpdateCheck"));
        }

        public override string Name
        {
            get { return "AutoUpdateTask"; }
        }

        public override async Task<IBackgroundTask> Execute(object state)
        {
            var latestRelease = await GetLatestRelease();

            var latestVersion = ParseVersionFromRelease(latestRelease);
            var currentversion = ParseVersionFromAssembly(GetType().Assembly);

            if (latestVersion > currentversion)
            {
                var asset = await GetUpdateAsset(latestRelease);
                if (asset != null)
                {
                    var updateInstallerPath = await DownloadAsset(asset);

                    StartInstallProcess(updateInstallerPath, currentversion, latestVersion);
                }
            }

            return this;
        }

        private void StartInstallProcess(string updateInstallerPath, SemVersion currentversion, SemVersion latestVersion)
        {
            var logFileName = string.Format("scoop.service-autoupdate-{0}-v{1}to{2}.log", DateTime.Now.ToString("yyyyMMddTHHmmss"), currentversion, latestVersion);
            var logDirectory = Path.Combine(Environment.CurrentDirectory, @"updates\logs\");
            if (!Directory.Exists(logDirectory))
                Directory.CreateDirectory(logDirectory);

            var logPath = Path.Combine(logDirectory, logFileName);

            var msiExecPath = Path.Combine(Environment.SystemDirectory, "msiexec.exe");
            var msiExecArguments = string.Format(@"/i ""{0}"" /passive /l* ""{1}""", updateInstallerPath, logPath);

            Process.Start(new ProcessStartInfo(msiExecPath, msiExecArguments));
        }

        private async Task<Release> GetLatestRelease()
        {
            var releases = await _gitHubClient.Release.GetAll(_repositoryOwner, _repostoryName);

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
            var assets = await _gitHubClient.Release.GetAssets(_repositoryOwner, _repostoryName, release.Id);

            return assets.FirstOrDefault(a => a.Name.StartsWith("Scoop.Service.Installer"));
        }

        private async Task<string> DownloadAsset(ReleaseAsset asset)
        {
            var updateDownloadDirectory = Path.Combine(Environment.CurrentDirectory, "updates");
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