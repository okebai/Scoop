using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Hosting;
using Scoop.Core.Caching;
using Scoop.Core.Tasks.Interfaces;

namespace Scoop.Core.Tasks
{
    public abstract class Task : ITask, IRegisteredObject
    {
        public abstract string Name { get; }
        public int Iteration { get; private set; }

        protected Timer Timer { get; private set; }
        protected ITaskListener TaskListener { get; set; }

        protected Task()
        {
            Timer = new Timer(TimerTrigger, null, TimeSpan.FromMilliseconds(-1), TimeSpan.FromMilliseconds(-1));

            HostingEnvironment.RegisterObject(this);
        }

        public ITask Start(ITaskListener taskListener)
        {
            TaskListener = taskListener;

            var interval = TimeSpan.FromSeconds(2);
            Timer.Change(TimeSpan.Zero, interval);

            return this;
        }

        private void TimerTrigger(object state)
        {
            Iteration++;
            Execute(state);
        }

        public abstract ITask Execute(object state);

        public void Stop(bool immediate)
        {
            Timer.Dispose();

            HostingEnvironment.UnregisterObject(this);
        }

        public TaskResultHistory<T> GetHistory<T>() where T : class, ITask
        {
            return CacheHandler.Instance.Get<TaskResultHistory<T>>();
        }

        public TaskResultHistory<T> SaveHistory<T>(ITaskResult taskResult) where T : class, ITask
        {
            var taskResultHistory = GetHistory<T>();
            taskResultHistory.TaskResults.Add(taskResult);
            CacheHandler.Instance.Set(taskResultHistory);

            return taskResultHistory;
        }

    }
}
