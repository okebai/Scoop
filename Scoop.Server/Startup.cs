using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;
using Scoop.Server;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Scoop.Core.BackgroundTasks;
using Scoop.Core.BackgroundTasks.Interfaces;
using Scoop.Server.Tasks;
using Microsoft.Owin.Cors;

[assembly: OwinStartup(typeof(Startup))]

namespace Scoop.Server
{
    public class Startup
    {
        public const string Url = "http://*:60080";
        public static List<IBackgroundTask> Tasks { get; set; }
        private readonly JsonSerializerSettings _jsonSerializerSettings = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };

        public void Configuration(IAppBuilder app)
        {
            app.UseCors(CorsOptions.AllowAll);

            // At the time (2015-01-18) Chrome has issues with NTLM authentication and WebSockets. SignalR can handle this though, by falling back on other protocols. (https://code.google.com/p/chromium/issues/detail?id=123862)
            // http://stackoverflow.com/questions/17485046/signalr-cross-domain-connections-with-self-hosting-and-authentication
            // http://stackoverflow.com/questions/17457382/windows-authentication-with-signalr-and-owin-self-hosting
            //var listener = (HttpListener)app.Properties[typeof(HttpListener).FullName];
            //listener.AuthenticationSchemeSelectorDelegate += request =>
            //    request.Headers.Get("Access-Control-Request-Method") != null
            //        ? AuthenticationSchemes.Anonymous
            //        : AuthenticationSchemes.Ntlm;

            app.Map("/AvailableTasks", builder =>
            {
                builder.Use((context, next) =>
                {
                    var availableTasksJson = JsonConvert.SerializeObject(Tasks, _jsonSerializerSettings);

                    var response = context.Response;
                    response.StatusCode = 200;
                    response.ContentType = "application/json";
                    response.Write(availableTasksJson);

                    return next();
                });
            });

            app.MapSignalR(new HubConfiguration
            {
                EnableDetailedErrors = true
            });

            InitializeTasks();
        }

        public void InitializeTasks()
        {
            Tasks = new List<IBackgroundTask>
            {
                PerformanceTask.Instance.Start(PerformanceTaskListener.Instance),
                //ServerStatusTask.Instance.Start(ServerStatusTaskListener.Instance),
                //AutoUpdateTask.Instance.Start(),
            };
        }
    }
}
