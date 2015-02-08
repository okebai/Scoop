using System;
using System.Threading;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Hosting;
using Scoop.Core.Caching;
using Scoop.Core.Common;
using Scoop.Core.BackgroundTasks.Interfaces;

namespace Scoop.Core.BackgroundTasks
{
    public class PerformanceTask : BackgroundTask
    {
        private static readonly Lazy<PerformanceTask> _instance = new Lazy<PerformanceTask>(() => new PerformanceTask());
        public static PerformanceTask Instance { get { return _instance.Value; } }
        private PerformanceTask() { }

        public override string Name
        {
            get { return "PerformanceTask"; }
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

        private PerformanceCounter _diskPerformanceCounter;
        private PerformanceCounter DiskPerformanceCounter
        {
            get
            {
                return _diskPerformanceCounter ?? (_diskPerformanceCounter =
                    new PerformanceCounter
                    {
                        CategoryName = "LogicalDisk",
                        CounterName = "Avg. Disk sec/Transfer",
                        InstanceName = "_Total"
                    });
            }
        }


        public override async Task<IBackgroundTask> Execute(object state)
        {
            await ReadPerformance();

            return this;
        }

        private async Task ReadPerformance()
        {
            var cpuValue = CpuPerformanceCounter.NextValue();

            var diskValue = DiskPerformanceCounter.NextValue();
            
            var performanceInfo = PerformanceInfo.Instance.GetPerformanceInfo();
            var memoryUsedPercent = 1.0 - (performanceInfo.PhysicalAvailableBytes / (double)performanceInfo.PhysicalTotalBytes);

            var taskResult = new PerformanceTaskResult(this, cpuValue, memoryUsedPercent, diskValue);

            SaveHistory<PerformanceTask>(taskResult);

            TaskListener.HandleResult(taskResult);
        }
    }
}
