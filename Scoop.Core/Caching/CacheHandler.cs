using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Runtime.Caching;
using System.Web.Hosting;
using CacheItemPriority = System.Runtime.Caching.CacheItemPriority;

namespace Scoop.Core.Caching
{
    public class CacheHandler
    {
        public ConcurrentDictionary<string, bool> CacheKeys { get; private set; }
        public CacheHandler()
        {
            CacheKeys = new ConcurrentDictionary<string, bool>();
        }

        public bool Contains(string key)
        {
            return MemoryCache.Default.Contains(key);
        }

        public void Set(ICacheHandlerItem item)
        {
            var newCacheItem = new CacheItem(item.CacheKey, item);
            var cacheItemPolicy = new CacheItemPolicy
            {
                Priority = CacheItemPriority.NotRemovable,
                SlidingExpiration = TimeSpan.FromMinutes(3)
            };

            MemoryCache.Default.Set(newCacheItem, cacheItemPolicy);
            var success = CacheKeys.AddOrUpdate(newCacheItem.Key, key => true, (key, oldValue) => true);
            if (!success)
                Trace.WriteLine("CacheKeys.AddOrUpdate failed " + newCacheItem.Key);
        }

        public T Get<T>(string key) where T : class, ICacheHandlerItem
        {
            return MemoryCache.Default.Get(key) as T;
        }

        public T Get<T>() where T : class, ICacheHandlerItem, new()
        {
            var t = new T();
            return MemoryCache.Default.Get(t.CacheKey) as T ?? t;
        }

        public DateTime? LastUpdate<T>() where T : IRegisteredObject
        {
            return MemoryCache.Default.Get(typeof(T).FullName) as DateTime?;
        }

        public void SetLastUpdate<T>(DateTime lastUpdate) where T : IRegisteredObject
        {
            MemoryCache.Default.Add(typeof(T).FullName, lastUpdate, null);
        }
    }
}