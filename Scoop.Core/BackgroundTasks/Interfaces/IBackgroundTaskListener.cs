using System.Threading.Tasks;

namespace Scoop.Core.BackgroundTasks.Interfaces
{
    public interface IBackgroundTaskListener<T> where T : IBackgroundTask
    {
        Task HandleResult(IBackgroundTaskResult taskResult);
    }
}