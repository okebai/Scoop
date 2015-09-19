using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Scoop.Core.BackgroundTasks.ServerStatus
{
    public class WindowsUpdateStatus
    {
        public int TotalHistoryCount { get; set; }
        public DateTime LastUpdateDate { get; set; }
        public int PendingUpdatesCount { get; set; }
    }
}
