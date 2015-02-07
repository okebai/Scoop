namespace Scoop.Core.Tasks.Interfaces
{
    public interface ITask
    {
        string Name { get; }
        int Iteration { get; }

        ITask Start(ITaskListener taskListener);
        void Stop(bool immediate);


        TaskResultHistory<T> GetHistory<T>() where T : class, ITask;
        TaskResultHistory<T> SaveHistory<T>(ITaskResult taskResult) where T : class, ITask;
    }
}
