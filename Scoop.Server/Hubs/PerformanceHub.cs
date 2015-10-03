using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.BackgroundTasks;

namespace Scoop.Server.Hubs
{
    public class PerformanceHub : BaseHub
    {
        private readonly PerformanceTask _performanceTask;
        public PerformanceHub(PerformanceTask performanceTask)
        {
            _performanceTask = performanceTask;
        }

        public void GetPerformanceHistory()
        {
            var taskResultHistory = _performanceTask.GetHistory<PerformanceTask>();

            Clients.Caller.updatePerformanceHistory(taskResultHistory.TaskResults);
        }
    }
}
