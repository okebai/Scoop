using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Scoop.Core.Caching;
using Scoop.Core.Configuration;

namespace Scoop.Core.Tasks.Performance
{
    public class PerformanceTask : BackgroundTask<IBackgroundTaskListener<PerformanceTaskResult>, PerformanceTaskResult>
    {
        public PerformanceTask(CacheHandler cacheHandler, IBackgroundTaskListener<PerformanceTaskResult> taskListener, BackgroundTaskConfiguration backgroundTaskConfiguration)
            : base(cacheHandler, taskListener, backgroundTaskConfiguration)
        { }

        protected override int HistoryMaxItemCount() { return BackgroundTaskConfiguration.PerformanceHistoryMaxItemCount; }
        protected override TimeSpan Interval() { return BackgroundTaskConfiguration.PerformanceInterval; }

        public override string Name => "PerformanceTask";
        public override string FriendlyName => "Performance";
        public override Guid Guid { get; } = Guid.ParseExact("af388b090a5249659fb9b41e5542718a", "N");

        private PerformanceCounter CpuPerformanceCounter { get; } = new PerformanceCounter
        {
            CategoryName = "Processor",
            CounterName = "% Processor Time",
            InstanceName = "_Total"
        };

        private PerformanceCounter DiskPerformanceCounter { get; } = new PerformanceCounter
        {
            CategoryName = "LogicalDisk",
            CounterName = "Avg. Disk sec/Transfer",
            InstanceName = "_Total"
        };

        public override async Task Execute(object state)
        {
            var taskResult = ReadPerformance();

            SaveHistory(taskResult);

            await TaskListener.HandleResult(taskResult);
        }

        private PerformanceTaskResult ReadPerformance()
        {
            var cpuValue = CpuPerformanceCounter.NextValue();

            var diskValue = DiskPerformanceCounter.NextValue();

            var performanceInfo = PerformanceInfo.Instance.GetPerformanceInfo();
            var memoryUsedPercent = 1.0 - (performanceInfo.PhysicalAvailableBytes / (double)performanceInfo.PhysicalTotalBytes);

            return new PerformanceTaskResult(this, cpuValue, memoryUsedPercent, diskValue);
        }
    }
}