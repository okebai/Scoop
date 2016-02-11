using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Scoop.Server.Hubs
{
    public class ServerHub : BaseHub
    {
        // ReSharper disable once UnusedMember.Global
        public void GetAvailableTasks()
        {
            var availableTasks = Startup.Tasks.Select(task => task.FriendlyName);

            Clients.Caller.updateAvailableTasks(availableTasks);
        }
    }
}
