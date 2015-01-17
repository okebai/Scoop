using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace Scoop.Service
{
    public partial class ScoopService : ServiceBase
    {
        public const string Name = "Scoop Service";
        public const string LogName = "Scoop Log";

        public ScoopService(string[] args)
        {
            ServiceName = Name;

            InitializeComponent();

            var eventLog = new EventLog();
            if (!EventLog.SourceExists(ServiceName))
                EventLog.CreateEventSource(ServiceName, LogName);

            eventLog.Source = ServiceName;
            eventLog.Log = LogName;        
        }

        protected override void OnStart(string[] args)
        {
        }

        protected override void OnStop()
        {
        }
    }
}
