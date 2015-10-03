using System.Threading.Tasks;

namespace Scoop.Core.BackgroundTasks.Interfaces
{
    public interface IBackgroundTaskListener
    {
        Task HandleResult(IBackgroundTaskResult taskResult);
    }
}
