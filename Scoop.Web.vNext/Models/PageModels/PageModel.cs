﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Http;
using Newtonsoft.Json;
using Scoop.Core.ConnectionStorage;

namespace Scoop.Web.vNext.Models.PageModels
{
    public class PageModel
    {
        public string ConnectionStorageJson
        {
            get
            {
                var connectionStorage = new CookieConnectionStorage(new HttpContextWrapper(HttpContext.Current));

                return JsonConvert.SerializeObject(connectionStorage.Connections);
            }
        }

        
        public string Title { get; set; }
    }
}