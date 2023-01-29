using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kepler.UI.Web.Pages.auth
{
    public class logoutModel : PageModel
    {
        public async void OnGetAsync()
        {
            await HttpContext.SignOutAsync();
        }
    }
}
