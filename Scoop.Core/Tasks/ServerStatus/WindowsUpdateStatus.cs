using System;

namespace Scoop.Core.Tasks.ServerStatus
{
    public class WindowsUpdateStatus
    {
        public int TotalHistoryCount { get; set; }
        public DateTime LastUpdateDate { get; set; }
        public int PendingUpdatesCount { get; set; }
    }
}