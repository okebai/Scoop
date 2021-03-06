﻿using System;
using System.Collections.Generic;

namespace Scoop.Core.BackgroundTasks.Interfaces
{
    public interface IBackgroundTaskResult
    {
        string TaskName { get; }

        Dictionary<string, double> Values { get; }
        Dictionary<string, string> Messages { get; }

        DateTime Timestamp { get; }
    }
}