using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Scoop.Core.ConnectionStorage
{
    public interface IConnectionStorage
    {
        List<IConnectionModel> Connections { get; }
        void AddOrUpdateConnection(IConnectionModel connection);
        void RemoveConnection(IConnectionModel connection);
    }
}
