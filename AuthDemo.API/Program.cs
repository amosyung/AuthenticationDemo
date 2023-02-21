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
    //A policy to specify allowed clients
    options.AddPolicy("approved_client", policy => policy.RequireClaim("client_id", new string[] { "sc1024" })); 
    //A policy to specify specific scopes
    options.AddPolicy("allow_info", policy => policy.RequireClaim("scope", "accountapi.info"));
    options.AddPolicy("allow_transact", policy => policy.RequireClaim("scope", "accountapi.transact"));
    options.AddPolicy("manager", policy => policy.RequireClaim("employee_classification", "B10", "B11"));
    //options.AddPolicy("allow_transact", o => AuthorizationLibrary.AccessPolicy.AddCanSubmitTransaction(options));
    
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
    //.RequireAuthorization("approved_client")    
    //.RequireAuthorization("allow_info")
    .WithName("GetWeatherForecast");

app.MapGet("/account", (IAccountRepository repo, HttpContext context) =>
{
    string idpUserId = context.User.Claims.FirstOrDefault(c => c.Type == "sub").Value;
    return repo.GetAccount(idpUserId);
}).RequireAuthorization("allow_info")
.RequireAuthorization("manager");
    

app.MapPost("/transaction", (string id, AccountTransaction tran, IAccountRepository repo) =>
{
    return repo.ProcessTransaction(id, tran);
}).RequireAuthorization("allow_transact");

app.Run();

internal record WeatherForecast(DateTime Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}