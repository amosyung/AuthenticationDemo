using Duende.IdentityServer;
using Duende.IdentityServer.Models;

namespace Marvel.IDP;

public static class Config
{
    public static IEnumerable<IdentityResource> IdentityResources =>
        new IdentityResource[]
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
            //add a new scope to include the new custom claim.
            new IdentityResource("user_group", "Employee classification or category", new []{"employee_classification" })
        };

    public static IEnumerable<ApiResource> ApiResources => new ApiResource[]
    {
        new ApiResource("accountapi", "Account API")
        {
            //Tie the API resources together with the API scopes
            Scopes = { "accountapi.info", "accountapi.transact" }
        }
    };

    public static IEnumerable<ApiScope> ApiScopes =>
        new ApiScope[]
            { new ApiScope("accountapi.info"), new ApiScope("accountapi.transact") };

    public static IEnumerable<Client> Clients =>
        new Client[] 
            { 
                new Client()
                {
                    ClientName = "small_client",
                    ClientId= "sc1024",
                    AllowedGrantTypes = GrantTypes.Code,
                    RedirectUris =
                    {
                        "https://localhost:7106/signin-oidc"
                    },
                    PostLogoutRedirectUris =
                    {
                        "https://localhost:7106/signout-callback-oidc"
                    },
                    AllowedScopes =
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        "user_group", //open the scope for request
                        "accountapi.info",
                        "accountapi.transact"
                    },
                    ClientSecrets = {new Secret("perfect_harmony_18".Sha512()) },
                    RequireConsent = true
                }
            };
}