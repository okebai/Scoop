using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Scoop.Web.Models.PageModels
{
    public class DashboardPageModel : PageModel
    {
        public DashboardPageModel()
        {
            Title = "Dashboard";

            var testData = new List<object>();
            
            var rand = new Random();
            var now = DateTime.Now;
            for (var i = 0; i < 120; i++)
            {
                testData.Add(new
                {
                    x = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0).AddSeconds(-30 * i),
                    y = rand.Next(0, 101)
                });
            }

            TestData = JsonConvert.SerializeObject(testData, new JavaScriptDateTimeConverter());
        }

        public string TestData { get; set; }
    }
}