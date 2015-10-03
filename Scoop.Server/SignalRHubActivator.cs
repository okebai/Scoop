using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR.Hubs;
using SimpleInjector;

namespace Scoop.Server
{
    public class SignalRHubActivator : IHubActivator
    {
        private readonly Container _container;

        public SignalRHubActivator(Container container)
        {
            _container = container;
        }

        public IHub Create(HubDescriptor descriptor)
        {
            if (descriptor == null)
                throw new ArgumentNullException(nameof(descriptor));

            if (descriptor.HubType == null)
                return null;

            var hub = _container.GetInstance(descriptor.HubType) ?? Activator.CreateInstance(descriptor.HubType);

            return hub as IHub;
        }
    }
}
