using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AuthTemplate.Pages
{
    public class AboutMeModel : PageModel
    {
        public IEnumerable<Tuple<string, string>> Claims { get; set; }

        public void OnGet()
        {
            List<Tuple<string, string>> cls = new List<Tuple<string, string>>();
            foreach (var c in User.Claims)
            {
                cls.Add(new Tuple<string, string>(c.Type, c.Value));
            }
            Claims = cls;
        }
    }
}
