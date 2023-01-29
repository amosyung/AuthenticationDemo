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
}).AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
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
