using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Scoop.Web.Models;
using Scoop.Web.Models.PageModels;

namespace Scoop.Web.Controllers
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