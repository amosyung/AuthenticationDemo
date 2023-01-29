using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AuthDemo.ClientWeb.Pages
{
    [Authorize]
    public class Bizniz1Model : PageModel
    {
        private ILogger<Bizniz1Model> _logger;
        public Bizniz1Model(ILogger<Bizniz1Model> logger) 
        {
            _logger = logger;
        }
        public async Task OnGetAsync()
        {
            
        }
    }
}
