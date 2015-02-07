using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Runtime.Remoting.Contexts;
using System.Web;
using Microsoft.Owin;
using Newtonsoft.Json;

namespace Scoop.Core.ConnectionStorage
{
    public class CookieConnectionStorage : IConnectionStorage
    {
        private const string _cookieName = "connections";

        public IDictionary<Guid, IConnectionModel> Connections { get; private set; }
        public HttpContextBase HttpContext { get; set; }

        public CookieConnectionStorage(HttpContextBase httpContext)
        {
            HttpContext = httpContext;

            if (!HttpContext.Request.Cookies.AllKeys.Contains(_cookieName))
            {
                Connections = new Dictionary<Guid, IConnectionModel>();
                return;
            }

            var cookieJson = HttpContext.Request.Cookies[_cookieName].Value;

            Connections = JsonConvert.DeserializeObject<Dictionary<Guid, ConnectionModel>>(cookieJson)
                .ToDictionary(ck => ck.Key, cv => (IConnectionModel)cv.Value);
        }

        public void AddOrUpdateConnection(IConnectionModel connection)
        {
            if (connection == null || connection.Uri == null)
                return;

            if (connection.Guid.HasValue && Connections.ContainsKey(connection.Guid.Value))
                Connections[connection.Guid.Value] = connection;
            else
            {
                var uri = connection.Uri.OriginalString;
                var existingKeys = Connections.Where(c => c.Value.Uri.OriginalString == uri).Select(c => c.Key).ToList();
                if (existingKeys.Count > 0)
                {
                    foreach (var key in existingKeys)
                        Connections[key] = connection;
                }
                else
                {
                    connection.Guid = Guid.NewGuid();
                    Connections.Add(connection.Guid.Value, connection);
                }
            }

            UpdateCookie();
        }

        public void RemoveConnection(IConnectionModel connection)
        {
            if (connection == null || connection.Uri == null)
                return;

            if (connection.Guid.HasValue && Connections.ContainsKey(connection.Guid.Value))
                Connections.Remove(connection.Guid.Value);
            else
            {
                var uri = connection.Uri.OriginalString;
                var existingKeys = Connections.Where(c => c.Value.Uri.OriginalString == uri).Select(c => c.Key);
                foreach (var key in existingKeys)
                    Connections.Remove(key);
            }

            UpdateCookie();
        }

        private void UpdateCookie()
        {
            HttpContext.Response.Cookies.Remove(_cookieName);

            var connectionsJson = JsonConvert.SerializeObject(Connections);
            var connectionCookie = new HttpCookie(_cookieName, connectionsJson);

            HttpContext.Response.Cookies.Add(connectionCookie);
        }
    }
}