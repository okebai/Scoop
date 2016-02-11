namespace Scoop.Core.Tasks.Performance
{
    public class PerformanceTaskResult : BackgroundTaskResult
    {
        public double Cpu => Values["cpu"];
        public double Memory => Values["memory"];
        public double Disk => Values["disk"];

        public PerformanceTaskResult(PerformanceTask task, double cpuValue, double memValue, double diskValue)
            : base(task)
        {
            Values.Add("cpu", cpuValue);
            Values.Add("memory", memValue);
            Values.Add("disk", diskValue);
        }
    }
}