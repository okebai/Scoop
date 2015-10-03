using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.BackgroundTasks.Interfaces;
using Scoop.Server.Hubs;

namespace Scoop.Server.Tasks
{
    public class ServerStatusTaskListener : IBackgroundTaskListener
    {
        private readonly IHubContext<ServerStatusHub> _hubContext;

        public ServerStatusTaskListener(IHubContext<ServerStatusHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task HandleResult(IBackgroundTaskResult taskResult)
        {
            await _hubContext.Clients.All.updateServerStatus(taskResult.TaskName, taskResult.Values, taskResult.Timestamp);
        }
    }
}
