﻿using System;
using System.Linq;
using System.Threading.Tasks;
using Scoop.Core.Caching;
using Scoop.Core.Configuration;
using WUApiLib;

namespace Scoop.Core.Tasks.ServerStatus
{
    public class ServerStatusTask : BackgroundTask<IBackgroundTaskListener<ServerStatusTaskResult>, ServerStatusTaskResult>
    {
        public ServerStatusTask(CacheHandler cacheHandler, IBackgroundTaskListener<ServerStatusTaskResult> taskListener, BackgroundTaskConfiguration backgroundTaskConfiguration)
            : base(cacheHandler, taskListener, backgroundTaskConfiguration)
        { }

        protected override int HistoryMaxItemCount() { return BackgroundTaskConfiguration.PerformanceHistoryMaxItemCount; }
        protected override TimeSpan Interval() { return BackgroundTaskConfiguration.PerformanceInterval; }

        public override string Name => "ServerStatusTask";
        public override string FriendlyName => "Server status";
        public override Guid Guid { get; } = Guid.ParseExact("8b77683a18b949589f95333929a21f38", "N");

        private WindowsUpdateStatus _lastWindowsUpdateStatus = new WindowsUpdateStatus();

        public override async Task Execute(object state)
        {
            _lastWindowsUpdateStatus = await ReadWindowsUpdateStatus();

            var serverStatusTaskResult = new ServerStatusTaskResult(this, _lastWindowsUpdateStatus);

            SaveHistory(serverStatusTaskResult);

            await TaskListener.HandleResult(serverStatusTaskResult);
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