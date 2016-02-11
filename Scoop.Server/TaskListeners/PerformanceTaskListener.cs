using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.Tasks;
using Scoop.Core.Tasks.Performance;
using Scoop.Server.Hubs;

namespace Scoop.Server.TaskListeners
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
