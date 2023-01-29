using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AuthDemo.ClientWeb.Pages
{
    public class UserInfoModel : PageModel
    {
        public IEnumerable<KeyValuePair<string, string>> Claims { get; private set; }

        public async Task OnGetAsync()
        {
            var claims = new List<KeyValuePair<string, string>>();  
            foreach (var claim in User.Claims)
            {
                claims.Add(new KeyValuePair<string, string>(claim.Type, claim.Value));
            }
            Claims = claims;
        }
    }
}
