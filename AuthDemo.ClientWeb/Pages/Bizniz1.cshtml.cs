using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;

namespace AuthDemo.ClientWeb.Pages
{
    public record WeatherForecast(DateTime Date, int TemperatureC, string? Summary);
    public class AccountTransaction
    {
        public string? TransactionType { get; set; }
        public DateTime TransactionTime { get; set; }
        public double Amount { get; set; }
    }

    public class AccountDetail
    {
        public double OpeningBalance { get; set; }
        public double CurrentBalance { get; set; }
        public IEnumerable<AccountTransaction> TransactionList { get; set; }
    }

    [Authorize]
    public class Bizniz1Model : PageModel
    {
        private ILogger<Bizniz1Model> _logger;
        public IEnumerable<WeatherForecast> Forecasts { get; private set; }
        public AccountDetail AccountDetail { get; private set; }

        IHttpClientFactory _clientFactory;
        public Bizniz1Model(ILogger<Bizniz1Model> logger, IHttpClientFactory httpClientFactory) 
        {
            _logger = logger;
            _clientFactory = httpClientFactory;
        }
        public async Task OnGetAsync()
        {
            string x = User.Identity.Name;
            HttpClient client = _clientFactory.CreateClient("ApiClient");
            var request = new HttpRequestMessage(HttpMethod.Get, "/weatherforecast");
            var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            Forecasts = await client.GetFromJsonAsync< WeatherForecast[]>("https://localhost:7139/weatherforecast");
            AccountDetail = await client.GetFromJsonAsync<AccountDetail>($"https://localhost:7139/account?id=alice");
        }
    }
}
