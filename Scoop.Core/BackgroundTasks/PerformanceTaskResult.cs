using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.UI.WebControls.WebParts;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks
{
    public class PerformanceTaskResult : BackgroundTaskResult
    {
        public PerformanceTaskResult(IBackgroundTask task, params double[] values)
            : base(task)
        {
            for (var i = 0; i < values.Length; i++)
            {
                Values.Add(i.ToString(), values[i]);
            }
        }
    }
}
