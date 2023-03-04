using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace AuthDemo.ClientWeb.Pages
{
    public class LogoutModel : PageModel
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public LogoutModel(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }
        public async Task OnGetAsync()
        {
            if (User.Identity.IsAuthenticated)
                await Logout();
            //RedirectToAction("Index", "Home");
        }

        public async Task Logout()
        {
            var idpHost = _httpClientFactory.CreateClient("IDPClient");

            //get the discovery document which details a great deal of information about the 
            //IDP. The most important ones are the urls of various endpoints
            var discoveryDocument = await idpHost.GetDiscoveryDocumentAsync(); 
            var accessTokenRevocationResponse = await idpHost.RevokeTokenAsync(new TokenRevocationRequest
            {
                Address = discoveryDocument.RevocationEndpoint,
                ClientId = _configuration["idpConnection:clientId"], //"sc1024",
                ClientSecret = _configuration["idpConnection:clientSecret"],
                Token = await HttpContext.GetTokenAsync(OpenIdConnectParameterNames.AccessToken)
            }) ;

            var refreshTokenRevocationResponse = await idpHost.RevokeTokenAsync(new TokenRevocationRequest
            {
                Address = discoveryDocument.RevocationEndpoint,
                ClientId = _configuration["idpConnection:clientId"], //"sc1024",
                ClientSecret = _configuration["idpConnection:clientSecret"],
                Token = await HttpContext.GetTokenAsync(OpenIdConnectParameterNames.RefreshToken)
            });


            //logout from our application. But we are still logged in the IDP.
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme);
        }
    }
}
