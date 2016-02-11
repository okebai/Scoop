using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.Owin;
using Owin;
using Scoop.Server;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Microsoft.Owin.Cors;
using Scoop.Core.Caching;
using Scoop.Core.Configuration;
using Scoop.Core.Tasks;
using Scoop.Core.Tasks.AutoUpdate;
using Scoop.Core.Tasks.Performance;
using Scoop.Core.Tasks.ServerStatus;
using Scoop.Server.TaskListeners;
using SimpleInjector;

[assembly: OwinStartup(typeof(Startup))]

namespace Scoop.Server
{
    public class Startup
    {
        public const string Url = "http://*:60080";
        public static List<IBackgroundTask> Tasks { get; private set; }
        private readonly JsonSerializerSettings _jsonSerializerSettings;
        private readonly JsonSerializer _serializer;
        private readonly Container _container;

        public Startup()
        {
            _jsonSerializerSettings = new JsonSerializerSettings {ContractResolver = new SignalRContractResolver()};
            _serializer = JsonSerializer.Create(_jsonSerializerSettings);
            _container = new Container();

            RegisterTypes(_container);
        }

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

        private void InitializeTasks()
        {
            Tasks = new List<IBackgroundTask>
            {
                _container.GetInstance<PerformanceTask>(),
                //_container.GetInstance<ServerStatusTask>(),
                _container.GetInstance<AutoUpdateTask>(),
            };

            foreach (var task in Tasks)
            {
                task.Start();
            }
        }

        private void RegisterTypes(Container container)
        {
            // SignalR
            GlobalHost.DependencyResolver.Register(typeof(IHubActivator), () => new SignalRHubActivator(container));
            GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () => _serializer);
            container.Register<IHubActivator, SignalRHubActivator>();

            // Caching
            container.RegisterSingleton<CacheHandler>();

            // Background Tasks
            container.RegisterSingleton<BackgroundTaskConfiguration>();
            container.RegisterSingleton<PerformanceTask>();
            container.RegisterSingleton<AutoUpdateTask>();
            container.RegisterSingleton<ServerStatusTask>();

            // Task Listeners
            container.RegisterSingleton<IBackgroundTaskListener<PerformanceTaskResult>, PerformanceTaskListener>();
            container.RegisterSingleton<IBackgroundTaskListener<ServerStatusTaskResult>, ServerStatusTaskListener>();
        }
    }
}
