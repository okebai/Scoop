using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Westwind.Utilities.Configuration;

namespace Scoop.Core.Configuration
{
    public class BackgroundTaskConfiguration : AppConfiguration
    {
        private static readonly Lazy<BackgroundTaskConfiguration> _instance = new Lazy<BackgroundTaskConfiguration>(() =>
        {
            var instance = new BackgroundTaskConfiguration();
            instance.Initialize();

            return instance;
        });

        public static BackgroundTaskConfiguration Instance
        {
            get { return _instance.Value; }
        }

        public TimeSpan DefaultInterval { get; set; }
        public int DefaultHistoryMaxItemCount { get; set; }

        public TimeSpan PerformanceInterval { get; set; }
        public int PerformanceHistoryMaxItemCount { get; set; }

        public TimeSpan AutoUpdateInterval { get; set; }
        public int AutoUpdateHistoryMaxItemCount { get; set; }

        public BackgroundTaskConfiguration()
        {
            DefaultInterval = TimeSpan.FromSeconds(10);
            DefaultHistoryMaxItemCount = 10;

            PerformanceInterval = TimeSpan.FromSeconds(2);
            PerformanceHistoryMaxItemCount = 100;

            AutoUpdateInterval = TimeSpan.FromHours(2);
            AutoUpdateHistoryMaxItemCount = 5;
        }
    }
}
