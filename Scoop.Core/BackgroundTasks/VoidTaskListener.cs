using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks
{
    public class VoidTaskListener : IBackgroundTaskListener<IBackgroundTask>
    {
        public async Task HandleResult(IBackgroundTaskResult taskResult)
        {
            await Task.Delay(0);
        }
    }
}