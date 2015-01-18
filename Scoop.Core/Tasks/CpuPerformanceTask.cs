using System;
using System.Threading;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Hosting;
using Scoop.Core.Caching;
using Scoop.Core.Tasks.Interfaces;

namespace Scoop.Core.Tasks
{
    public class CpuPerformanceTask : Task
    {
        private static readonly Lazy<CpuPerformanceTask> _instance = new Lazy<CpuPerformanceTask>(() => new CpuPerformanceTask());
        public static CpuPerformanceTask Instance { get { return _instance.Value; } }

        public override string Name
        {
            get { return "CpuPerformanceTask"; }
        }

        private PerformanceCounter _cpuPerformanceCounter;
        private PerformanceCounter CpuPerformanceCounter
        {
            get
            {
                return _cpuPerformanceCounter ?? (_cpuPerformanceCounter =
                    new PerformanceCounter
                    {
                        CategoryName = "Processor",
                        CounterName = "% Processor Time",
                        InstanceName = "_Total"
                    });
            }
        }

        private CpuPerformanceTask() { }

        public override ITask Execute(object state)
        {
            ReadCpu();

            return this;
        }

        private void ReadCpu()
        {
            CacheHandler.Instance.SetLastUpdate<CpuPerformanceTask>(DateTime.Now);

            var cpuValue = CpuPerformanceCounter.NextValue();

            var taskResult = new PerformanceTaskResult(this, cpuValue);
            CacheHandler.Instance.Set(taskResult);

            TaskListener.HandleResult(taskResult);
        }
    }
}
