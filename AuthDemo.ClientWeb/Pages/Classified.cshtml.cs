using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AuthDemo.ClientWeb.Pages
{
    [Authorize(Roles = "B11")]
    public class ClassifiedModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
