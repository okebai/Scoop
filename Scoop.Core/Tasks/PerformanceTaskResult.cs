﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.UI.WebControls.WebParts;
using Scoop.Core.Tasks.Interfaces;

namespace Scoop.Core.Tasks
{
    public class PerformanceTaskResult : TaskResult
    {
        public PerformanceTaskResult(ITask task, params double[] values)
            : base(task)
        {
            for (var i = 0; i < values.Length; i++)
            {
                Values.Add(i.ToString(), values[i]);
            }
        }
    }
}
