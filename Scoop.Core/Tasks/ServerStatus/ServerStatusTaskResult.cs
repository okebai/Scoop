namespace Scoop.Core.Tasks.ServerStatus
{
    public class ServerStatusTaskResult : BackgroundTaskResult
    {
        public ServerStatusTaskResult(IBackgroundTask task, WindowsUpdateStatus windowsUpdateStatus)
            : base(task)
        {
            Values.Add(nameof(windowsUpdateStatus.PendingUpdatesCount), windowsUpdateStatus.PendingUpdatesCount);
            Values.Add(nameof(windowsUpdateStatus.TotalHistoryCount), windowsUpdateStatus.TotalHistoryCount);
            Messages.Add(nameof(windowsUpdateStatus.LastUpdateDate), windowsUpdateStatus.LastUpdateDate.ToShortDateString());
        }
    }
}