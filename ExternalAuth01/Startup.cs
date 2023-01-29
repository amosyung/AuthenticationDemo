using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExternalAuth01
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
            //Make sure the port number of the application is set to 44371 in the launchsettings.json in Porpoerties folder.
            //This is necessary because the redirect URL has been set to go to localhost:44371 on google's side.
            services.AddAuthentication(
                o =>
                {
                    o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                    //o.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
                })
                .AddCookie(o => o.LoginPath = "/auth/login") //customize login page. Otherwise it would default to /account/login
                .AddGoogle(o => {
                    o.ClientId = Configuration["google-authentication:id"]; // "1082675409933-0vopjkers0hmgc2ehmhpkt4nngblj4v1.apps.googleusercontent.com";
                    o.ClientSecret = Configuration["google-authentication:secret"]; // "qDz0C4KCSFKFZyDOEAdEsT-7";
                })
                .AddFacebook(o => {
                    o.AppId = Configuration["facebook-authentication:id"]; // "430081524760577";
                    o.AppSecret = Configuration["facebook-authentication:id"]; // "03f31b9ae238a3c2e3e18f0720449f4f";
                })
                ;
            
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
