using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.Tasks.Performance;

namespace Scoop.Server.Hubs
{
    public class PerformanceHub : BaseHub
    {
        private readonly PerformanceTask _performanceTask;
        public PerformanceHub(PerformanceTask performanceTask)
        {
            _performanceTask = performanceTask;
        }

        // ReSharper disable once UnusedMember.Global
        public void GetPerformanceHistory()
        {
            var taskResultHistory = _performanceTask.GetHistory();

            Clients.Caller.updatePerformanceHistory(taskResultHistory.TaskResults);
        }
    }
}
