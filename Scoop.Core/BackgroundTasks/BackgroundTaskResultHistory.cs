﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.Caching;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks
{
    public class BackgroundTaskResultHistory<T> : ICacheHandlerItem where T : class, IBackgroundTask
    {
        private List<IBackgroundTaskResult> _taskResults;
        public List<IBackgroundTaskResult> TaskResults
        {
            get { return _taskResults ?? (_taskResults = new List<IBackgroundTaskResult>()); }
        }

        public string CacheKey
        {
            get { return "BackgroundTaskResultHistory_" + typeof(T).FullName; }
        }
    }
}