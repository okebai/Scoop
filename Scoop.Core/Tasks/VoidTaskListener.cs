using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Scoop.Core.Tasks.Interfaces;

namespace Scoop.Core.Tasks
{
   public class VoidTaskListener : ITaskListener
    {
        public void HandleResult(ITaskResult taskResult)
        {
            // Do nothing
        }
    }
}
