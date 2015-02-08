using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks
{
    public class VoidTaskListener : IBackgroundTaskListener
    {
        public void HandleResult(IBackgroundTaskResult taskResult)
        {
            // Do nothing
        }
    }
}
