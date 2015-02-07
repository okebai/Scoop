using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Scoop.Web.Models;
using Scoop.Web.Models.PageModels;

namespace Scoop.Web.Controllers
{
    [RoutePrefix("Dashboard")]
    public class DashboardController : Controller
    {
        [Route("~/")]
        [Route("~/Dashboard")]
        public ActionResult Dashboard()
        {
            var model = new DashboardPageModel();

            return View("Dashboard", model);
        }
    }
}