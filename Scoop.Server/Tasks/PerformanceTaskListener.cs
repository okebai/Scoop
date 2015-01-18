using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.Tasks;
using Scoop.Core.Tasks.Interfaces;
using Scoop.Server.Hubs;

namespace Scoop.Server.Tasks
{
    public class PerformanceTaskListener : ITaskListener
    {
        private static readonly Lazy<PerformanceTaskListener> _instance = new Lazy<PerformanceTaskListener>(() => new PerformanceTaskListener());
        public static PerformanceTaskListener Instance { get { return _instance.Value; } }

        private readonly IHubContext _hubContext;

        private PerformanceTaskListener()
        {
            _hubContext = GlobalHost.ConnectionManager.GetHubContext<PerformanceHub>();
        }

        public void HandleResult(ITaskResult taskResult)
        {
            _hubContext.Clients.All.updatePerformance(taskResult.TaskName, taskResult.Values, taskResult.Timestamp);
        }
    }
}
