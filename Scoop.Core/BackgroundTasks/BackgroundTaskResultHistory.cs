using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.Caching;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks
{
    public class BackgroundTaskResultHistory<TResult> : ICacheHandlerItem
        where TResult : class, IBackgroundTaskResult
    {
        public List<TResult> TaskResults { get; set; }
        public string CacheKey => "BackgroundTaskResultHistory_" + typeof(TResult).FullName;
    }
}