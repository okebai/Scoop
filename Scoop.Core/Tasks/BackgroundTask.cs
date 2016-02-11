using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Scoop.Core.Caching;
using Scoop.Core.Configuration;

namespace Scoop.Core.Tasks
{
    public abstract class BackgroundTask<TListener, TResult> : IBackgroundTask<TResult>
        where TListener : class, IBackgroundTaskListener<TResult>
        where TResult : class, IBackgroundTaskResult
    {
        private readonly CacheHandler _cacheHandler;

        public abstract string Name { get; }
        public abstract string FriendlyName { get; }
        public abstract Guid Guid { get; }
        public int Iteration { get; private set; }

        protected virtual int HistoryMaxItemCount() { return BackgroundTaskConfiguration.DefaultHistoryMaxItemCount; }
        protected virtual TimeSpan Interval() { return BackgroundTaskConfiguration.DefaultInterval; }

        protected Timer Timer { get; private set; }
        private readonly object _timerLock;
        protected TListener TaskListener { get; set; }
        protected BackgroundTaskConfiguration BackgroundTaskConfiguration { get; set; }

        protected BackgroundTask(CacheHandler cacheHandler, TListener taskListener, BackgroundTaskConfiguration backgroundTaskConfiguration)
        {
            _cacheHandler = cacheHandler;
            _timerLock = new object();
            Timer = new Timer(TimerTrigger, null, TimeSpan.FromMilliseconds(-1), TimeSpan.FromMilliseconds(-1));
            TaskListener = taskListener;
            BackgroundTaskConfiguration = backgroundTaskConfiguration;

            //TODO Trigger Start() from Startup
            //HostingEnvironment.RegisterObject(this);
        }

        public void RestartTimer()
        {
            Timer.Change(TimeSpan.Zero, Interval());
        }
        public void PauseTimer()
        {
            Timer.Change(TimeSpan.FromMilliseconds(-1), Interval());
        }

        public void Start()
        {
            RestartTimer();
        }
        public void Stop()
        {
            TaskListener = null;
            PauseTimer();
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

        public abstract Task Execute(object state);

        public void Stop(bool immediate)
        {
            Timer.Dispose();

            // TODO Add dispose logic, maybe look here http://stackoverflow.com/a/27714453
            //HostingEnvironment.UnregisterObject(this);
        }


        public BackgroundTaskResultHistory<TResult> GetHistory()
        {
            return _cacheHandler.Get<BackgroundTaskResultHistory<TResult>>();
        }

        public BackgroundTaskResultHistory<TResult> SaveHistory(TResult taskResult)
        {
            var taskResultHistory = GetHistory();
            var historyMaxItemCount = HistoryMaxItemCount();

            if (taskResultHistory.TaskResults == null)
                taskResultHistory.TaskResults = new List<TResult>(historyMaxItemCount);

            if (taskResultHistory.TaskResults.Any() && (taskResultHistory.TaskResults.Count + 1) > historyMaxItemCount)
                taskResultHistory.TaskResults.RemoveRange(0, taskResultHistory.TaskResults.Count - historyMaxItemCount);

            taskResultHistory.TaskResults.Add(taskResult);

            _cacheHandler.Set(taskResultHistory);

            return taskResultHistory;
        }
    }
}