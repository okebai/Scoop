using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using Scoop.Core.ConnectionStorage;
using Scoop.Web.Models;

namespace Scoop.Web.Controllers
{
    [RoutePrefix("Connection")]
    public class ConnectionController : Controller
    {
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Connect")]
        public ContentResult ConnectPost(ConnectionModel connection)
        {
            var connectionStorage = new CookieConnectionStorage(HttpContext);

            connectionStorage.AddOrUpdateConnection(connection);

            return Content(JsonConvert.SerializeObject(connectionStorage.Connections), "application/json");
        }
    }
}