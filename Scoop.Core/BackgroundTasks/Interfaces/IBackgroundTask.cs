using System;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Scoop.Core.BackgroundTasks.Interfaces
{
    public interface IBackgroundTask<TResult> : IBackgroundTask
        where TResult : class, IBackgroundTaskResult
    {
        BackgroundTaskResultHistory<TResult> GetHistory();
        BackgroundTaskResultHistory<TResult> SaveHistory(TResult taskResult);
    }

    public interface IBackgroundTask
    {
        Guid Guid { get; }
        string Name { get; }
        string FriendlyName { get; }

        [JsonIgnore]
        int Iteration { get; }

        void RestartTimer();
        void PauseTimer();
        void Start();
        void Stop();

        Task Execute(object state);
        void Stop(bool immediate);
    }
}