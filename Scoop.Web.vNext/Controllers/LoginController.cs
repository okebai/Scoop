using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Mvc;
using Scoop.Web.vNext.Models;
using Scoop.Web.vNext.Models.PageModels;

namespace Scoop.Web.vNext.Controllers
{
    [RoutePrefix("Login")]
    public class LoginController : Controller
    {
        [Route("~/Login")]
        public ActionResult Login()
        {
            var model = new LoginPageModel();

            return View("Login", model);
        }
    }
}