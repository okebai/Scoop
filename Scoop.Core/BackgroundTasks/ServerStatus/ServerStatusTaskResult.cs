using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks.ServerStatus
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