using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace Scoop.Service
{
    static class Program
    {
        static void Main(string[] args)
        {
            var servicesToRun = new ServiceBase[] 
            { 
                new ScoopService(args) 
            };

            ServiceBase.Run(servicesToRun);
        }
    }
}
