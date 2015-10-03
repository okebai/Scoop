using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Scoop.Web.vNext.Controllers
{
    public class BaseController : Controller
    {
        private readonly Lazy<JsonSerializerSettings> _jsonSerializerSettings = new Lazy<JsonSerializerSettings>(() => new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
        });

        public JsonSerializerSettings JsonSerializerSettings => _jsonSerializerSettings.Value;

        public string ToJson(object obj)
        {
            return JsonConvert.SerializeObject(obj, JsonSerializerSettings);
        }

        public ContentResult JsonContent(object obj, JsonSerializerSettings jsonSerializerSettings)
        {
            var json = ToJson(obj);
            return Content(json, "application/json");
        }

        public ContentResult JsonContent(object obj)
        {
            return JsonContent(obj, JsonSerializerSettings);
        }
    }
}