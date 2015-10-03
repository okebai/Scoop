using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using Microsoft.Framework.Caching.Memory;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.Caching
{
    public class CacheHandler
    {
        public ConcurrentDictionary<string, bool> CacheKeys { get; private set; }

        private readonly IMemoryCache _memoryCache;
        public CacheHandler(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
            CacheKeys = new ConcurrentDictionary<string, bool>();
        }

        public bool Contains(string key)
        {
            object dummy;
            return _memoryCache.TryGetValue(key, out dummy);
        }

        public void Set(ICacheHandlerItem item)
        {
            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                Priority = CacheItemPriority.NeverRemove,
                SlidingExpiration = TimeSpan.FromMinutes(3)
            };

            _memoryCache.Set(item.CacheKey, item, cacheEntryOptions);
            var success = CacheKeys.AddOrUpdate(item.CacheKey, key => true, (key, oldValue) => true);
            if (!success)
                Trace.WriteLine("CacheKeys.AddOrUpdate failed " + item.CacheKey);
        }

        public T Get<T>(string key) where T : class, ICacheHandlerItem
        {
            return _memoryCache.Get<T>(key);
        }

        public T Get<T>() where T : class, ICacheHandlerItem, new()
        {
            var t = new T();
            return _memoryCache.Get(t.CacheKey) as T ?? t;
        }

        public DateTime? LastUpdate<T>() where T : IBackgroundTask
        {
            return _memoryCache.Get(typeof(T).FullName) as DateTime?;
        }

        public void SetLastUpdate<T>(DateTime lastUpdate) where T : IBackgroundTask
        {
            _memoryCache.Set(typeof(T).FullName, lastUpdate, null);
        }
    }
}