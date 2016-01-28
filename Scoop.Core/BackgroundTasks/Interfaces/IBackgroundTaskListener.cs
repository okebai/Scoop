using System.Threading.Tasks;

namespace Scoop.Core.BackgroundTasks.Interfaces
{
    public interface IBackgroundTaskListener<in TResult>
        where TResult : class, IBackgroundTaskResult
    {
        Task HandleResult(TResult taskResult);
    }
}