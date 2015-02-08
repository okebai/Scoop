using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.BackgroundTasks;

namespace Scoop.Server.Hubs
{
    public class PerformanceHub : Hub
    {
        public void GetPerformanceHistory()
        {
            var taskResultHistory = PerformanceTask.Instance.GetHistory<PerformanceTask>();

            Clients.All.updatePerformanceHistory(taskResultHistory.TaskResults);
        }    }
}
