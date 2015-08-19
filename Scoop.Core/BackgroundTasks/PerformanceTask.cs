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
using Scoop.Core.Configuration;

namespace Scoop.Core.BackgroundTasks
{
    public class PerformanceTask : BackgroundTask
    {
        private static readonly Lazy<PerformanceTask> _instance = new Lazy<PerformanceTask>(() => new PerformanceTask());
        public static PerformanceTask Instance { get { return _instance.Value; } }

        protected override int HistoryMaxItemCount() { return BackgroundTaskConfiguration.Instance.PerformanceHistoryMaxItemCount; }
        protected override TimeSpan Interval() { return BackgroundTaskConfiguration.Instance.PerformanceInterval; }

        private readonly Guid _guid;

        private PerformanceTask()
        {
            _guid = Guid.ParseExact("af388b090a5249659fb9b41e5542718a", "N");
        }

        public override string Name
        {
            get { return "PerformanceTask"; }
        }
        public override string FriendlyName
        {
            get { return "Performance"; }
        }
        public override Guid Guid { get { return _guid; } }

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
            ReadPerformance();

            return this;
        }

        private void ReadPerformance()
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
