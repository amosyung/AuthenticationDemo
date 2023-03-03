using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System.Text;

namespace AuthDemo.ClientWeb.Pages
{
    
    public class PrivacyModel : PageModel
    {
        private readonly ILogger<PrivacyModel> _logger;

        public PrivacyModel(ILogger<PrivacyModel> logger)
        {
            _logger = logger;
        }

        public async Task OnGetAsync()
        {
            await LogIdentityInfoAsync();
            //await LogAccessTokenAsync();
            await LogTokenAsync(OpenIdConnectParameterNames.AccessToken, "Access token");
            await LogTokenAsync(OpenIdConnectParameterNames.RefreshToken, "Refresh token");
        }

        public async Task LogIdentityInfoAsync()
        {
            var identityToken = await HttpContext.GetTokenAsync(OpenIdConnectParameterNames.IdToken);

            var userClaimStringBuilder = new StringBuilder();
            foreach(var claim in User.Claims)
            {
                userClaimStringBuilder.Append($"\nClaim type: {claim.Type} - Claim value: {claim.Value}");
            }

            _logger.LogInformation($"Identity Token & user claims: \n{identityToken}\n{userClaimStringBuilder}");
        }
        /*
        public async Task LogAccessTokenAsync()
        {
            var token = await HttpContext.GetTokenAsync(OpenIdConnectParameterNames.AccessToken);
            _logger.LogInformation($"Access token: \n{token}");
        }

        public async Task LogRefreshTokenAsync()
        {
            var token = await HttpContext.GetTokenAsync(OpenIdConnectParameterNames.RefreshToken);
            _logger.LogInformation($"Refresh token: \n{token}");
        }
        */
        private async Task LogTokenAsync(string tokenType, string headerText)
        {
            var token = await HttpContext.GetTokenAsync(tokenType);
            _logger.LogInformation($"{headerText}: \n{token}");
        }
    }
}