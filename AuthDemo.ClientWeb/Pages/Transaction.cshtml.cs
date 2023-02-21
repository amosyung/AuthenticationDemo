using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AuthDemo.ClientWeb.Pages
{
    [Authorize(Policy = "SubmitTransaction")]
    public class TransactionModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
