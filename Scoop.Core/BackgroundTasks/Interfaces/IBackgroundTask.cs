namespace Scoop.Core.BackgroundTasks.Interfaces
{
    public interface IBackgroundTask
    {
        string Name { get; }
        int Iteration { get; }

        IBackgroundTask Start(IBackgroundTaskListener taskListener);
        void Stop(bool immediate);


        BackgroundTaskResultHistory<T> GetHistory<T>() where T : class, IBackgroundTask;
        BackgroundTaskResultHistory<T> SaveHistory<T>(IBackgroundTaskResult taskResult) where T : class, IBackgroundTask;
    }
}
