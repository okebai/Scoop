using System;
using System.Collections.Generic;

namespace Scoop.Core.Tasks.Interfaces
{
    public interface ITaskResult
    {
        string TaskName { get; }

        Dictionary<string, double> Values { get; }
        Dictionary<string, string> Messages { get; }

        DateTime Timestamp { get;}
    }
}
