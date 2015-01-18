namespace Scoop.Core.Tasks.Interfaces
{
    public interface ITaskListener
    {
        void HandleResult(ITaskResult taskResult);
    }
}
