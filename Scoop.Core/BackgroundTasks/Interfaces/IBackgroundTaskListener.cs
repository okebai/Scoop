namespace Scoop.Core.BackgroundTasks.Interfaces
{
    public interface IBackgroundTaskListener
    {
        void HandleResult(IBackgroundTaskResult taskResult);
    }
}
