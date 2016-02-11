using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.BackgroundTasks;
using Scoop.Core.BackgroundTasks.Interfaces;
using Scoop.Core.BackgroundTasks.ServerStatus;
using Scoop.Server.Hubs;

namespace Scoop.Server.Tasks
{
    public class ServerStatusTaskListener : IBackgroundTaskListener<ServerStatusTaskResult>
    {
        private readonly IHubContext _hubContext;

        public ServerStatusTaskListener()
        {
            _hubContext = GlobalHost.ConnectionManager.GetHubContext<ServerStatusHub>();
        }

        public async Task HandleResult(ServerStatusTaskResult taskResult)
        {
            await _hubContext.Clients.All.updateServerStatus(taskResult.TaskName, taskResult.Values, taskResult.TimeStamp);
        }
    }
}
