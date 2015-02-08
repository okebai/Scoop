using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Hosting;
using Scoop.Core.Caching;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks
{
    public abstract class BackgroundTask : IBackgroundTask, IRegisteredObject
    {
        public abstract string Name { get; }
        public int Iteration { get; private set; }

        protected Timer Timer { get; private set; }
        protected IBackgroundTaskListener TaskListener { get; set; }
        protected TimeSpan Interval;

        protected BackgroundTask()
            : this(TimeSpan.FromSeconds(2))
        {
        }

        protected BackgroundTask(TimeSpan interval)
        {
            Interval = interval;

            Timer = new Timer(TimerTrigger, null, TimeSpan.FromMilliseconds(-1), TimeSpan.FromMilliseconds(-1));

            HostingEnvironment.RegisterObject(this);
        }

        public IBackgroundTask Start(IBackgroundTaskListener taskListener = null)
        {
            if (taskListener != null)
                TaskListener = taskListener;

            Timer.Change(TimeSpan.Zero, Interval);

            return this;
        }

        private void TimerTrigger(object state)
        {
            Iteration++;
            Execute(state);
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
            taskResultHistory.TaskResults.Add(taskResult);
            CacheHandler.Instance.Set(taskResultHistory);

            return taskResultHistory;
        }

    }
}
