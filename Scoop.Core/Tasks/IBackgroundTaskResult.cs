using System;
using System.Collections.Generic;

namespace Scoop.Core.Tasks
{
    public interface IBackgroundTaskResult
    {
        string TaskName { get; }

        Dictionary<string, double> Values { get; }
        Dictionary<string, string> Messages { get; }

        DateTime TimeStamp { get; }
    }
}