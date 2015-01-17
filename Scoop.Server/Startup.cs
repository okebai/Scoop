using Microsoft.Owin;
using Owin;
using Scoop.Server;
using Microsoft.Owin.Cors;

[assembly: OwinStartup(typeof(Startup))]

namespace Scoop.Server
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseCors(CorsOptions.AllowAll);
            app.MapSignalR();
        }
    }
}
