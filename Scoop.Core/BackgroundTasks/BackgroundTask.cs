using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Hosting;
using Scoop.Core.Caching;
using Scoop.Core.BackgroundTasks.Interfaces;
using Scoop.Core.Configuration;

namespace Scoop.Core.BackgroundTasks
{
    public abstract class BackgroundTask : IBackgroundTask, IRegisteredObject
    {
        public abstract string Name { get; }
        public abstract string FriendlyName { get; }
        public abstract Guid Guid { get; }
        public int Iteration { get; private set; }

        protected virtual int HistoryMaxItemCount() { return BackgroundTaskConfiguration.Instance.DefaultHistoryMaxItemCount; }
        protected virtual TimeSpan Interval() { return BackgroundTaskConfiguration.Instance.DefaultInterval; }

        protected Timer Timer { get; private set; }
        private readonly object _timerLock;
        protected IBackgroundTaskListener TaskListener { get; set; }

        protected BackgroundTask()
        {
            _timerLock = new object();
            Timer = new Timer(TimerTrigger, null, TimeSpan.FromMilliseconds(-1), TimeSpan.FromMilliseconds(-1));

            HostingEnvironment.RegisterObject(this);
        }

        public void RestartTimer()
        {
            Timer.Change(TimeSpan.Zero, Interval());
        }
        public void PauseTimer()
        {
            Timer.Change(TimeSpan.FromMilliseconds(-1), Interval());
        }

        public IBackgroundTask Start(IBackgroundTaskListener taskListener = null)
        {
            if (taskListener != null)
                TaskListener = taskListener;

            RestartTimer();

            return this;
        }
        public IBackgroundTask Stop()
        {
            TaskListener = null;
            PauseTimer();

            return this;
        }

        private void TimerTrigger(object state)
        {
            if (Monitor.TryEnter(_timerLock))
            {
                try
                {
                    Iteration++;
                    Execute(state);
                }
                finally
                {
                    Monitor.Exit(_timerLock);
                }
            }
        }

        public abstract Task<IBackgroundTask> Execute(object state);

        public void Stop(bool immediate)
        {
            Timer.Dispose();

            HostingEnvironment.UnregisterObject(this);
        }

        public BackgroundTaskResultHistory<T> GetHistory<T>() where T : class, IBackgroundTask
        {
            return CacheHandler.Instance.Get<BackgroundTaskResultHistory<T>>();
        }

        public BackgroundTaskResultHistory<T> SaveHistory<T>(IBackgroundTaskResult taskResult) where T : class, IBackgroundTask
        {
            var taskResultHistory = GetHistory<T>();
            var historyMaxItemCount = HistoryMaxItemCount();

            if (taskResultHistory.TaskResults == null)
                taskResultHistory.TaskResults = new List<IBackgroundTaskResult>(historyMaxItemCount);

            if (taskResultHistory.TaskResults.Any() && (taskResultHistory.TaskResults.Count + 1) > historyMaxItemCount)
                taskResultHistory.TaskResults.RemoveRange(0, taskResultHistory.TaskResults.Count - historyMaxItemCount);

            taskResultHistory.TaskResults.Add(taskResult);

            CacheHandler.Instance.Set(taskResultHistory);

            return taskResultHistory;
        }
    }
}
