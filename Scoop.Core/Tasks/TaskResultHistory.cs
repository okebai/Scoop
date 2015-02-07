using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.Caching;
using Scoop.Core.Tasks.Interfaces;

namespace Scoop.Core.Tasks
{
    public class TaskResultHistory<T> : ICacheHandlerItem where T : class, ITask
    {
        private List<ITaskResult> _taskResults;
        public List<ITaskResult> TaskResults
        {
            get { return _taskResults ?? (_taskResults = new List<ITaskResult>()); }
        }

        public string CacheKey
        {
            get { return "TaskResultHistory_" + typeof(T).FullName; }
        }
    }
}
