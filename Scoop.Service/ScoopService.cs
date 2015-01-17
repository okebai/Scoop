using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Owin.Hosting;

namespace Scoop.Service
{
    public partial class ScoopService : ServiceBase
    {
        public const string Name = "ScoopService";
        public const string Url = "http://localhost:9300";

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

            // This will *ONLY* bind to localhost, if you want to bind to all addresses
            // use http://*:8080 to bind to all addresses. 
            // See http://msdn.microsoft.com/en-us/library/system.net.httplistener.aspx 
            // for more information.
            _signalrInstance = WebApp.Start<Server.Startup>(Url);

            _eventLog.WriteEntry("SignalR server listening on " + Url);
        }

        protected override void OnStop()
        {
            _signalrInstance.Dispose();

            _eventLog.WriteEntry("SignalR server listening on " + Url + " stopped.");
            _eventLog.Dispose();
        }
    }
}
