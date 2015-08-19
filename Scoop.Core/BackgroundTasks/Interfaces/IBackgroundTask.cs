using System;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Scoop.Core.BackgroundTasks.Interfaces
{
    public interface IBackgroundTask
    {
        Guid Guid { get; }
        string Name { get; }
        string FriendlyName { get; }

        [JsonIgnore]
        int Iteration { get; }

        void ReloadTimer();
        IBackgroundTask Start(IBackgroundTaskListener taskListener);
        Task<IBackgroundTask> Execute(object state);
        void Stop(bool immediate);

        BackgroundTaskResultHistory<T> GetHistory<T>() where T : class, IBackgroundTask;
        BackgroundTaskResultHistory<T> SaveHistory<T>(IBackgroundTaskResult taskResult) where T : class, IBackgroundTask;
    }
}
