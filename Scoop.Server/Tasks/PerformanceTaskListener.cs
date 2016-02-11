﻿using System;
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
    public class PerformanceTaskListener : IBackgroundTaskListener<PerformanceTaskResult>
    {
        private readonly IHubContext _hubContext;

        public PerformanceTaskListener()
        {
            _hubContext = GlobalHost.ConnectionManager.GetHubContext<PerformanceHub>();
        }

        public async Task HandleResult(PerformanceTaskResult taskResult)
        {
            await _hubContext.Clients.All.updatePerformance(taskResult);
        }
    }
}
