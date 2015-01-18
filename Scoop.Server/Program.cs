using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Owin.Hosting;

namespace Scoop.Server
{
    public class Program
    {
        static void Main(string[] args)
        {
            using (WebApp.Start<Startup>(Startup.Url))
            {
                Console.WriteLine("Server running on {0}", Startup.Url);
                Console.WriteLine("Type 'exit' to shut down server.");
                Console.ReadLine();
            }
        }
    }
}
