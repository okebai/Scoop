﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.BackgroundTasks;

namespace Scoop.Server.Hubs
{
    public class ServerStatusHub : BaseHub
    {
        private readonly ServerStatusTask _serverStatusTask;
        public ServerStatusHub(ServerStatusTask serverStatusTask)
        {
            _serverStatusTask = serverStatusTask;
        }

        public void GetServerStatusHistory()
        {
            var taskResultHistory = _serverStatusTask.GetHistory<ServerStatusTask>();

            Clients.Caller.updatePerformanceHistory(taskResultHistory.TaskResults);
        }
    }
}
