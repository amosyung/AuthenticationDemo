using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InternalAuth.UI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages(o =>
            {
                //set all pages to requires authorization by default
                o.Conventions.AuthorizeFolder("/");

                o.Conventions.AllowAnonymousToPage("/index"); //home page
                o.Conventions.AllowAnonymousToPage("/Privacy"); //privacy page
                o.Conventions.AllowAnonymousToPage("/auth/login"); //home page
                
            });
            services.AddAuthentication(o =>
            {
                o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                o.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
                .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme) //just add the default name. Perfectly fine to leave out the parameter
                .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, o => {
                    o.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                    o.Authority = "https://manulife-dev.login.sys.cac.preview.pcf.manulife.com/.well-known/openid-configuration"; //idp - middle ware use this to locate the discovery endpoint
                    o.ClientId = "638710ae-273a-49d0-a5d0-a4a9176c8037";
                    o.ResponseType = "code"; //specify code flow
                    o.UsePkce = false; //
                    o.Scope.Add("openid");
                    o.Scope.Add("profile"); //openid and profile scope are default. Adding them here explictly for illustration purpose only
                    o.SaveTokens = true;
                    o.ClientSecret = "2d68993a-bcf6-4738-8f96-ff30ad4c5dc3";
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
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

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
            });
        }
    }
}
