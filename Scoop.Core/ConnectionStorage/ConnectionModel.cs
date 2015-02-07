using System;

namespace Scoop.Core.ConnectionStorage
{
    public class ConnectionModel : IConnectionModel
    {
        public Guid? Guid { get; set; }
        public Uri Uri { get; set; }
        public string Name { get; set; }
        public bool AutoConnect { get; set; }
    }
}