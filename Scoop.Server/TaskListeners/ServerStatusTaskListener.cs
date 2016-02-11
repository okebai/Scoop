using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Scoop.Core.Tasks;
using Scoop.Core.Tasks.ServerStatus;
using Scoop.Server.Hubs;

namespace Scoop.Server.TaskListeners
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
