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
    public class ServerStatusTaskListener : IBackgroundTaskListener<ServerStatusTask>
    {
        private readonly IHubContext _hubContext;

        public ServerStatusTaskListener()
        {
            _hubContext = GlobalHost.ConnectionManager.GetHubContext<ServerStatusHub>();
        }

        public async Task HandleResult(IBackgroundTaskResult taskResult)
        {
            await _hubContext.Clients.All.updateServerStatus(taskResult.TaskName, taskResult.Values, taskResult.Timestamp);
        }
    }
}
