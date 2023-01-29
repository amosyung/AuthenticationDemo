using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kepler.UI.Web.Pages.auth
{
    public class loginModel : PageModel
    {
        public enum AuthenticationPartner { Google, Facebook}
        public IEnumerable<string> AuthPartners { get; set; }

        [BindProperty(SupportsGet =true)]
        public string ReturnUrl { get; set; }

        public IActionResult OnGetAsync( string idProvider)
        {
            if (string.IsNullOrEmpty(ReturnUrl))
                ReturnUrl = "/";

            AuthPartners = new string[] { "Google", "Facebook"};
            object p;
            if (!string.IsNullOrEmpty(idProvider) && Enum.TryParse(typeof(AuthenticationPartner), idProvider, out p))
            {
                string authenticationScheme;
                switch((AuthenticationPartner)p)
                {
                    case AuthenticationPartner.Google:
                        authenticationScheme = GoogleDefaults.AuthenticationScheme;
                        break;
                    case AuthenticationPartner.Facebook:
                        authenticationScheme = FacebookDefaults.AuthenticationScheme;
                        break;
                    default:
                        authenticationScheme = string.Empty;
                        break;
                }
                var properties = new AuthenticationProperties(){ RedirectUri = ReturnUrl };
                return Challenge(properties, authenticationScheme);
            }
            else
            {
                return new PageResult();
            }
        }
    }
}
