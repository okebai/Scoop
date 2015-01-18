namespace Scoop.Core.Tasks.Interfaces
{
    public interface ITask
    {
        string Name { get; }
        int Iteration { get; }

        ITask Start(ITaskListener taskListener);
        void Stop(bool immediate);
    }
}
