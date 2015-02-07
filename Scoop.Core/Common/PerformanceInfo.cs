using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace Scoop.Core.Common
{
    public class PerformanceInfo
    {
        private static readonly Lazy<PerformanceInfo> _instance = new Lazy<PerformanceInfo>(() => new PerformanceInfo());
        public static PerformanceInfo Instance { get { return _instance.Value; } }

        private PerformanceInfo() { }

        [DllImport("psapi.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetPerformanceInfo([Out] out PerformanceData performanceData, [In] int size);

        public PerformanceValues GetPerformanceInfo()
        {
            var perfInfo = new PerformanceData();

            if (!GetPerformanceInfo(out perfInfo, Marshal.SizeOf(perfInfo)))
                return new PerformanceValues();

            var pageSize = perfInfo.PageSize.ToInt64();

            return new PerformanceValues
            {
                // data in pages
                CommitTotalPages = perfInfo.CommitTotal.ToInt64(),
                CommitLimitPages = perfInfo.CommitLimit.ToInt64(),
                CommitPeakPages = perfInfo.CommitPeak.ToInt64(),

                // data in bytes
                PhysicalTotalBytes = perfInfo.PhysicalTotal.ToInt64() * pageSize,
                PhysicalAvailableBytes = perfInfo.PhysicalAvailable.ToInt64() * pageSize,
                SystemCacheBytes = perfInfo.SystemCache.ToInt64() * pageSize,
                KernelTotalBytes = perfInfo.KernelTotal.ToInt64() * pageSize,
                KernelPagedBytes = perfInfo.KernelPaged.ToInt64() * pageSize,
                KernelNonPagedBytes = perfInfo.KernelNonPaged.ToInt64() * pageSize,
                PageSizeBytes = pageSize,

                // counters
                HandlesCount = perfInfo.HandlesCount,
                ProcessCount = perfInfo.ProcessCount,
                ThreadCount = perfInfo.ThreadCount,
            };
        }
    }
}
