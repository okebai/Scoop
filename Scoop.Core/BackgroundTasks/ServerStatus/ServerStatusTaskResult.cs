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
        }
    }
}
