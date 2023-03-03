using Duende.IdentityServer;
using Duende.IdentityServer.Models;
using IdentityModel;

namespace Marvel.IDP;

public static class Config
{
    public static IEnumerable<IdentityResource> IdentityResources =>
        new IdentityResource[]
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
            //add a new scope to include the new custom claim.
            new IdentityResource("user_group", "Employee classification or category", new []{"employee_classification", "nationality", "acl" })
        };

    public static IEnumerable<ApiResource> ApiResources => new ApiResource[]
    {
        new ApiResource(
            "accountapi", 
            "Account API",
            new []{"employee_classification", JwtClaimTypes.BirthDate, "nationality", "acl" }
            )
        {
            //Tie the API resources together with the API scopes. When client 
            //request this scope [accountapi.info], the audience will become
            //"accountapi" because of this association. 
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
                    AllowOfflineAccess= true,   //by allowing offline access, the "offline_access" scope is added for request 
                                                //which is required for refresh token.
                    //AbsoluteRefreshTokenLifetime - these two values allow us to control the life time of the refresh token
                    //SlidingRefreshTokenLifetime
                    UpdateAccessTokenClaimsOnRefresh=true,  //this option allows a new access token will be created with updated information 
                                                            //any time it is refreshed.


                    //AuthorizationCodeLifetime = ... option to control the expiration of the authorization code
                    // IdentityTokenLifetime = ... option to control the expiration of the identity token
                    AccessTokenLifetime = 60, //default is 1 hour
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
                    //RequireConsent = true // take it out so that we bother with it anymore
                }
            };
}