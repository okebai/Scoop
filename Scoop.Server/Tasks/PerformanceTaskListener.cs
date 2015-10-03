using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.BackgroundTasks;
using Scoop.Core.BackgroundTasks.Interfaces;
using Scoop.Server.Hubs;

namespace Scoop.Server.Tasks
{
    public class PerformanceTaskListener : IBackgroundTaskListener
    {
        private readonly IHubContext<PerformanceHub> _hubContext;

        public PerformanceTaskListener(IHubContext<PerformanceHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task HandleResult(IBackgroundTaskResult taskResult)
        {
            await _hubContext.Clients.All.updatePerformance(taskResult.TaskName, taskResult.Values, taskResult.Timestamp);
        }
    }
}
