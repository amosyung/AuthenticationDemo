using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AuthDemo.ClientWeb.Pages
{
    public class LogoutModel : PageModel
    {
        public async Task OnGetAsync()
        {
            if (User.Identity.IsAuthenticated)
                await Logout();
            //RedirectToAction("Index", "Home");
        }

        public async Task Logout()
        {
            //logout from our application. But we are still logged in the IDP.
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme);
        }
    }
}
