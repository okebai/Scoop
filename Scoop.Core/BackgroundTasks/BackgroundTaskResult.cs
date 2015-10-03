using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.Caching;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks
{
    public abstract class BackgroundTaskResult : IBackgroundTaskResult
    {
        public Dictionary<string, double> Values { get; private set; }
        public Dictionary<string, string> Messages { get; private set; }
        public DateTime Timestamp { get; private set; }
        public string TaskName { get; private set; }

        protected BackgroundTaskResult(IBackgroundTask task)
        {
            Values = new Dictionary<string, double>();
            Messages = new Dictionary<string, string>();
            Timestamp = DateTime.Now;
            TaskName = task.Name;
        }
    }
}