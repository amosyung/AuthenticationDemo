using Duende.IdentityServer;
using Duende.IdentityServer.Test;
using Marvel.IDP.DbContexts;
using Marvel.IDP.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace Marvel.IDP;

internal static class HostingExtensions
{
    public static WebApplication ConfigureServices(this WebApplicationBuilder builder)
    {
        // uncomment if you want to add a UI
        builder.Services.AddRazorPages();
        builder.Services.AddDbContext<IdentityDbContext>(o =>
        {
            o.UseSqlServer(builder.Configuration.GetConnectionString("identityStore"));
        });
        builder.Services.AddScoped<ILocalUserService, LocalUserService>();
        //builder.Services.AddSingleton<TestUserStore>(TestUsers.CreateTestUserStore());

        builder.Services.AddIdentityServer(options =>
            {
                // https://docs.duendesoftware.com/identityserver/v6/fundamentals/resources/api_scopes#authorization-based-on-scopes
                options.EmitStaticAudienceClaim = true;
            })
            .AddProfileService<LocalUserProfileService>()
            .AddInMemoryIdentityResources(Config.IdentityResources)
            .AddInMemoryApiScopes(Config.ApiScopes)
            .AddInMemoryApiResources(Config.ApiResources) //add the ApiResources
            .AddInMemoryClients(Config.Clients);
        
        builder.Services.AddAuthentication()
            .AddOpenIdConnect("AAD", "Azure Active Directory", options =>
            {
                options.SignInScheme = IdentityServerConstants.ExternalCookieAuthenticationScheme;
                options.Authority = builder.Configuration["azure.active.directory:authority"]; //issuer from the meta data document
                options.ClientId = builder.Configuration["azure.active.directory:client_id"];
                options.ClientSecret = builder.Configuration["azure.active.directory:client_sceret"];
                options.ResponseType = "code";
                options.CallbackPath = new PathString("/signin-aad");
                options.SignedOutCallbackPath = new PathString("/signout-aad");
                options.Scope.Add("email");
                options.Scope.Add("offline_access");
                options.SaveTokens = true;
            });
        
        return builder.Build();
    }

    
    public static WebApplication ConfigurePipeline(this WebApplication app)
    { 
        app.UseSerilogRequestLogging();
    
        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        // uncomment if you want to add a UI
        app.UseStaticFiles();
        app.UseRouting();
            
        app.UseIdentityServer();

        // uncomment if you want to add a UI
        app.UseAuthorization();
        app.MapRazorPages().RequireAuthorization();

        return app;
    }
}
