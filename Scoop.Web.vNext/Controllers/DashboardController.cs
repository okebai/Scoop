using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Mvc;
using Scoop.Web.vNext.Models;
using Scoop.Web.vNext.Models.PageModels;

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