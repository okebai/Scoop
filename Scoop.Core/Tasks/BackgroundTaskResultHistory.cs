using System.Collections.Generic;
using Scoop.Core.Caching;

namespace Scoop.Core.Tasks
{
    public class BackgroundTaskResultHistory<TResult> : ICacheHandlerItem
        where TResult : class, IBackgroundTaskResult
    {
        public List<TResult> TaskResults { get; set; }
        public string CacheKey => "BackgroundTaskResultHistory_" + typeof(TResult).FullName;
    }
}