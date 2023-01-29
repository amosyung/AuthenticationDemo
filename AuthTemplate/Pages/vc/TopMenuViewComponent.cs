using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AuthTemplate.Pages.vc
{
    public class TopMenuViewComponent : ViewComponent
    {        

        public async Task< IViewComponentResult> InvokeAsync(string sectionName)
        {
            bool modelValue = User.Identity.IsAuthenticated;
            return View("LoginLogout", modelValue);

        }
    }
}
