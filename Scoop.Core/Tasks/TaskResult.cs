using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.Caching;
using Scoop.Core.Tasks.Interfaces;

namespace Scoop.Core.Tasks
{
    public abstract class TaskResult : ITaskResult, ICacheHandlerItem
    {
        public Dictionary<string, double> Values { get; private set; }
        public Dictionary<string, string> Messages { get; private set; }
        public DateTime Timestamp { get; private set; }
        public string TaskName { get; private set; }

        public abstract string CacheKey { get; }

        protected TaskResult(ITask task)
        {
            Values = new Dictionary<string, double>();
            Messages = new Dictionary<string, string>();
            Timestamp = DateTime.Now;
            TaskName = task.Name;
        }
    }
}
