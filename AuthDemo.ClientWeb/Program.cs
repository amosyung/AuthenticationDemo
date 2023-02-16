using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

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
    
    o.ClaimActions.MapJsonKey("role", "employee_classification"); //map the custom claim from the IDP to the role claim
    o.TokenValidationParameters = new() //map the claim type to ASP.NET Core's RoleClaim
    {
        NameClaimType = "name",
        RoleClaimType = "role"
    };
});


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
