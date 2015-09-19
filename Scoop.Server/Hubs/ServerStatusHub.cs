using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.BackgroundTasks;

namespace Scoop.Server.Hubs
{
    public class ServerStatusHub : BaseHub
    {
        public void GetServerStatusHistory()
        {
            var taskResultHistory = ServerStatusTask.Instance.GetHistory<ServerStatusTask>();

            Clients.Caller.updatePerformanceHistory(taskResultHistory.TaskResults);
        }
    }
}
