using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Newtonsoft.Json;
using Scoop.Core.ConnectionStorage;
using Scoop.Web.vNext.Models;

namespace Scoop.Web.vNext.Controllers
{
    [RoutePrefix("Connection")]
    public class ConnectionController : BaseController
    {
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("Add")]
        public ContentResult AddConnection(ConnectionModel connection)
        {
            var connectionStorage = new CookieConnectionStorage(HttpContext);

            connectionStorage.AddOrUpdateConnection(connection);

            return JsonContent(connectionStorage.Connections);
        }
        [HttpGet]
        [Route("List")]
        public ContentResult GetConnections()
        {
            var connectionStorage = new CookieConnectionStorage(HttpContext);

            return JsonContent(connectionStorage.Connections);
        }
    }
}