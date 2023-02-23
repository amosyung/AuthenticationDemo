using AuthorizationLibrary;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
string x = builder.Configuration["accountApiRoot"];

builder.Services.AddAccessTokenManagement(); //Handles access token for us

//create a HTTP client for accessing the API
builder.Services.AddHttpClient("ApiClient", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["accountApiRoot"]);
    client.DefaultRequestHeaders.Clear();
    client.DefaultRequestHeaders.Add(HeaderNames.Accept, "application/json");
})
    .AddUserAccessTokenHandler(); //add handler so that every request will include
                                  //the access token to the authorization header
;
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
}).AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, o =>
{
    //customize the access deny path. If not specified, ASP.NET core will 
    //default to /Account/AccessDenied
    o.AccessDeniedPath = "/NoEntry"; 
})
.AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, o =>
{
    o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    o.Authority = "https://localhost:5001";
    o.ClientId = "sc1024";
    o.ClientSecret = "perfect_harmony_18";
    o.ResponseType = "code";
    /*o.Scope.Add("openid");
    o.Scope.Add("profile");
    o.CallbackPath = new PathString("signin-oidc");
    o.SignedOutCallbackPath - default value is /signout-callback-oidc so we leave this alone
    */
    o.SaveTokens = true;
    o.GetClaimsFromUserInfoEndpoint= true;
    o.ClaimActions.Remove("aud");
    o.ClaimActions.DeleteClaim("sid");
    o.Scope.Add("user_group"); //add the custom scope that the IDP allowed
    o.Scope.Add("accountapi.info"); //request the scope to be included in the access token
    o.Scope.Add("accountapi.transact"); //request the scope to be included in the access token

    //The Name claim and the Role claim are mapped to default properties in the ASP.NET Core HTTP context
    o.ClaimActions.MapJsonKey("role", "employee_classification"); //map the custom claim from the IDP to the role claim
    o.ClaimActions.MapUniqueJsonKey("birthdate", "birthdate");
    o.ClaimActions.MapUniqueJsonKey("nationality", "nationality");
    o.ClaimActions.MapUniqueJsonKey("acl", "acl");
    o.TokenValidationParameters = new() //map the claim type to ASP.NET Core's RoleClaim
    {
        NameClaimType = "name",
        RoleClaimType = "role"
    };
});

builder.Services.AddAuthorization(o => o.CanSubmitTransaction());


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.Run();
