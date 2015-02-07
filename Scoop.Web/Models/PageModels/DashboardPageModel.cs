using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using Newtonsoft.Json;
using Scoop.Core.ConnectionStorage;

namespace Scoop.Web.Models.PageModels
{
    public class DashboardPageModel : PageModel
    {
        public DashboardPageModel()
        {
            Title = "Dashboard";
            
        }
    }
}