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
        private static readonly Lazy<ServerStatusTaskListener> _instance = new Lazy<ServerStatusTaskListener>(() => new ServerStatusTaskListener());
        public static ServerStatusTaskListener Instance => _instance.Value;

        private readonly IHubContext _hubContext;

        private ServerStatusTaskListener()
        {
            _hubContext = GlobalHost.ConnectionManager.GetHubContext<ServerStatusHub>();
        }

        public void HandleResult(IBackgroundTaskResult taskResult)
        {
            _hubContext.Clients.All.updateServerStatus(taskResult.TaskName, taskResult.Values, taskResult.Timestamp);
        }
    }
}
