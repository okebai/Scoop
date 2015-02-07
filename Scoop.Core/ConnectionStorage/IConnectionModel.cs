using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Scoop.Core.ConnectionStorage
{
    public interface IConnectionModel
    {
        Guid? Guid { get; set; }
        Uri Uri { get; set; }
        string Name { get; set; }
        bool AutoConnect { get; set; }
    }
}
