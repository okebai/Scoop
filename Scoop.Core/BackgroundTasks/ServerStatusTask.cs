using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.BackgroundTasks.Interfaces;
using Scoop.Core.BackgroundTasks.ServerStatus;
using Scoop.Core.Configuration;
using WUApiLib;

namespace Scoop.Core.BackgroundTasks
{
    public class ServerStatusTask : BackgroundTask
    {
        private static readonly Lazy<ServerStatusTask> _instance = new Lazy<ServerStatusTask>(() => new ServerStatusTask());
        public static ServerStatusTask Instance => _instance.Value;

        private ServerStatusTask() { }

        protected override int HistoryMaxItemCount() { return BackgroundTaskConfiguration.Instance.PerformanceHistoryMaxItemCount; }
        protected override TimeSpan Interval() { return BackgroundTaskConfiguration.Instance.PerformanceInterval; }

        public override string Name => "ServerStatusTask";
        public override string FriendlyName => "Server status";
        public override Guid Guid { get; } = Guid.ParseExact("8b77683a18b949589f95333929a21f38", "N");

        private WindowsUpdateStatus _lastWindowsUpdateStatus = new WindowsUpdateStatus();

        public override async Task<IBackgroundTask> Execute(object state)
        {
            _lastWindowsUpdateStatus = await ReadWindowsUpdateStatus();

            var serverStatusTaskResult = new ServerStatusTaskResult(this, _lastWindowsUpdateStatus);

            SaveHistory<ServerStatusTask>(serverStatusTaskResult);

            TaskListener.HandleResult(serverStatusTaskResult);

            return this;
        }

        private async Task<WindowsUpdateStatus> ReadWindowsUpdateStatus()
        {
            var updateSession = new UpdateSession();
            var updateSearcher = updateSession.CreateUpdateSearcher();

            var totalHistoryCount = updateSearcher.GetTotalHistoryCount();
            if (totalHistoryCount == _lastWindowsUpdateStatus.TotalHistoryCount)
                return _lastWindowsUpdateStatus;

            var queryHistory = updateSearcher.QueryHistory(0, totalHistoryCount);
            var historyEntries = queryHistory.Cast<IUpdateHistoryEntry>().ToList();

            var currentUpdateStatus = new WindowsUpdateStatus
            {
                TotalHistoryCount = totalHistoryCount,
                LastUpdateDate = historyEntries.Max(historyEntry => historyEntry.Date)
            };

            ISearchResult searchResult = null;
            await Task.Run(() =>
            {
                searchResult = updateSearcher.Search("IsInstalled=0 and IsHidden=0");
            });

            currentUpdateStatus.PendingUpdatesCount = searchResult.Updates.Count;

            return currentUpdateStatus;
        }
    }
}
