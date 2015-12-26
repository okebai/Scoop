using System;
using System.Diagnostics;
using System.ServiceProcess;
using Scoop.Server;
using Microsoft.Owin.Hosting;

namespace Scoop.Service
{
    public partial class ScoopService : ServiceBase
    {
        public const string Name = "ScoopService";

        private IDisposable _signalrInstance;
        private EventLog _eventLog;

        public ScoopService(string[] args)
        {
            ServiceName = Name;

            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            const string logName = "Application";

            if (!EventLog.SourceExists(ServiceName))
                EventLog.CreateEventSource(new EventSourceCreationData(ServiceName, logName));

            _eventLog = new EventLog
            {
                Source = ServiceName, 
                Log = logName
            };

            _signalrInstance = WebApp.Start<Startup>(Startup.Url);

            _eventLog.WriteEntry("Scoop SignalR server listening on " + Startup.Url, EventLogEntryType.Information);
        }

        protected override void OnStop()
        {
            _signalrInstance.Dispose();

            _eventLog.WriteEntry("Scoop SignalR server listening on " + Startup.Url + " stopped.", EventLogEntryType.Information);
            _eventLog.Dispose();
        }
    }
}
