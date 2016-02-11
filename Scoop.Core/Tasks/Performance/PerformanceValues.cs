namespace Scoop.Core.Tasks.Performance
{
    public class PerformanceValues
    {
        public long CommitTotalPages { get; set; }
        public long CommitLimitPages { get; set; }
        public long CommitPeakPages { get; set; }
        public long PhysicalTotalBytes { get; set; }
        public long PhysicalAvailableBytes { get; set; }
        public long SystemCacheBytes { get; set; }
        public long KernelTotalBytes { get; set; }
        public long KernelPagedBytes { get; set; }
        public long KernelNonPagedBytes { get; set; }
        public long PageSizeBytes { get; set; }
        public int HandlesCount { get; set; }
        public int ProcessCount { get; set; }
        public int ThreadCount { get; set; }
    }
}
