using System.Threading.Tasks;
using Scoop.Core.Tasks;

namespace Scoop.Core.TaskListeners
{
    public class VoidTaskListener : IBackgroundTaskListener<IBackgroundTaskResult>
    {
        public async Task HandleResult(IBackgroundTaskResult taskResult)
        {
            await Task.Delay(0);
        }
    }
}