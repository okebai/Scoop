using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Scoop.Core.Extensions
{
    public static class NameValueCollectionExtensions
    {
        public static T Get<T>(this NameValueCollection collection, string name)
        {
            T value;
            collection.TryGet(name, out value);

            return value;
        }

        public static bool TryGet<T>(this NameValueCollection collection, string name, out T value)
        {
            if (collection == null || !collection.HasKeys())
            {
                value = default(T);
                return false;
            }

            var item = collection.Get(name);
            if (item == null)
            {
                value = default(T);
                return false;
            }

            value = !typeof(T).IsEnum
                ? (T)Convert.ChangeType(item, typeof(T))
                : (T)Enum.Parse(typeof(T), item, true);

            return true;
        }
    }
}
