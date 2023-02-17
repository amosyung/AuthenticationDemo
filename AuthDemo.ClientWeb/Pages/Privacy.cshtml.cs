using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System.Text;

namespace AuthDemo.ClientWeb.Pages
{
    [Authorize]
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
            await LogAccessTokenAsync();
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

        public async Task LogAccessTokenAsync()
        {
            var accessToken = await HttpContext.GetTokenAsync(OpenIdConnectParameterNames.AccessToken);
            _logger.LogInformation($"Access token: \n{accessToken}");
        }
    }
}