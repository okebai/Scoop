using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Cors.Core;
using Microsoft.AspNet.Http;
using Microsoft.Framework.Caching.Memory;
using Microsoft.Framework.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Scoop.Core.BackgroundTasks;
using Scoop.Core.BackgroundTasks.Interfaces;
using Scoop.Core.Caching;
using Scoop.Server.Tasks;

namespace Scoop.Server
{
    public class Startup
    {
        public static List<IBackgroundTask> Tasks { get; set; }
        private readonly JsonSerializerSettings _jsonSerializerSettings = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };

        // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<IMemoryCache, MemoryCache>();
            services.AddSingleton<CacheHandler>();
            services.AddSingleton<PerformanceTask>();
            services.AddSingleton<PerformanceTaskListener>();

            services.AddCors();
            //services.AddCaching();
            services.AddSignalR(options =>
            {
                options.Hubs.EnableDetailedErrors = true;
            });
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseCors(policy => policy.AllowAnyOrigin());

            app.Map("/AvailableTasks", builder =>
            {
                builder.Use(async (context, next) =>
                {
                    var availableTasksJson = JsonConvert.SerializeObject(Tasks, _jsonSerializerSettings);

                    var response = context.Response;
                    response.StatusCode = 200;
                    response.ContentType = "application/json";
                    await response.WriteAsync(availableTasksJson);

                    await next();
                });
            });

            app.UseSignalR();

            InitializeTasks(app);
        }
        public void InitializeTasks(IApplicationBuilder app)
        {
            var performanceTask = app.ApplicationServices.GetService<PerformanceTask>();
            var performanceTaskListener = app.ApplicationServices.GetService<PerformanceTaskListener>();

            Tasks = new List<IBackgroundTask>
            {
                performanceTask.Start(performanceTaskListener),
                //ServerStatusTask.Instance.Start(ServerStatusTaskListener.Instance),
                //AutoUpdateTask.Instance.Start(),
            };
        }
    }
}
