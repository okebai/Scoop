using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Runtime.Remoting.Contexts;
using System.Web;
using Microsoft.AspNet.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Scoop.Core.ConnectionStorage
{
    public class CookieConnectionStorage : IConnectionStorage
    {
        private const string _cookieName = "connections";

        public List<IConnectionModel> Connections { get; private set; }
        public HttpContext HttpContext { get; set; }

        public CookieConnectionStorage(HttpContext httpContext)
        {
            HttpContext = httpContext;

            if (!HttpContext.Request.Cookies.ContainsKey(_cookieName))
            {
                Connections = new List<IConnectionModel>();
                return;
            }

            var cookieJson = HttpContext.Request.Cookies.Get(_cookieName);

            Connections = JsonConvert.DeserializeObject<List<ConnectionModel>>(cookieJson).Cast<IConnectionModel>().ToList();
        }

        public void AddOrUpdateConnection(IConnectionModel connection)
        {
            if (connection?.Uri == null)
                return;

            if (connection.Guid.HasValue)
            {
                Connections = Connections
                    .Where(c => !c.Guid.HasValue || c.Guid.Value == connection.Guid)
                    .ToList();

                Connections.Add(connection);
            }
            else
            {
                connection.Guid = Guid.NewGuid();
                Connections.Add(connection);
            }

            UpdateCookie();
        }

        public void RemoveConnection(IConnectionModel connection)
        {
            if (connection?.Guid == null)
                return;

            Connections = Connections
                .Where(c => c.Guid.HasValue && c.Guid.Value != connection.Guid)
                .ToList();

            UpdateCookie();
        }

        private void UpdateCookie()
        {
            HttpContext.Response.Cookies.Delete(_cookieName);

            var connectionsJson = JsonConvert.SerializeObject(Connections, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            var cookieOptions = new CookieOptions
            {
                Expires = DateTime.Now.AddYears(1)
            };

            HttpContext.Response.Cookies.Append(_cookieName, connectionsJson, cookieOptions);
        }
    }
}