using AuthDemo.API;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IAccountRepository, AccountRepository>();

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear(); //clear the claim type mapping to allow custom mapping in the next line

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme) //add Jwt bearer token processing middleware
    .AddJwtBearer(o => //Keep in mind this part is the configuration of the authentication scheme
    {
        o.Authority = "https://localhost:5001"; //the IDP. When the application is running for the first time it will
                                                //read the meta data from the IDP including all the endpoints available.                                                 
        o.Audience = "accountapi";  //the middleware is also responsible for validating the access token. This check to make 
                                    // sure this api ("accountapi") is specified in the access token as the audience.
        o.TokenValidationParameters = new TokenValidationParameters()
        {
            NameClaimType = "name", //Mapping the claim type from the tokens manually to avoid confusion.
            RoleClaimType = "role",
            ValidTypes = new[] { "at+jwt" } //counter the token confusion attack.
        };

    });
builder.Services.AddAuthorization(options =>
{
    /*
   options.DefaultPolicy = new AuthorizationPolicyBuilder()
  .RequireAuthenticatedUser()
  .build();
    */
    //options.AddPolicy("info_scope", policy => policy.RequireClaim("accountapi.info"));
    /*options.AddPolicy("manager", policy => policy.RequireRole("B10"));
    options.AddPolicy("operator", policy => policy.RequireRole("operator"));
    */
    options.AddPolicy("info_scope", policy => policy.RequireClaim("client_id", new string[] { "sc1024" }));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication(); //use authentication now!
app.UseAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", (HttpContext context) =>
{
    var s = context.User;
    var g = context.GetTokenAsync(OpenIdConnectParameterNames.IdToken).Result;
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateTime.Now.AddDays(index),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
    .RequireAuthorization("info_scope")
    .WithName("GetWeatherForecast");

app.MapGet("/account", (string id, IAccountRepository repo) =>
{
    return repo.GetAccount(id);
});

app.MapPost("/transaction", (string id, AccountTransaction tran, IAccountRepository repo) =>
{
    return repo.ProcessTransaction(id, tran);
});

app.Run();

internal record WeatherForecast(DateTime Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}