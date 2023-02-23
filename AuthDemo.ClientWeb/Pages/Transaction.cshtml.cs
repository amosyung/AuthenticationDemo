using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace AuthDemo.ClientWeb.Pages
{
    [Authorize(Policy = "SubmitTransaction")]
    public class TransactionModel : PageModel
    {
        private ILogger<Bizniz1Model> _logger;
        IHttpClientFactory _clientFactory;

        public TransactionModel(ILogger<Bizniz1Model> logger, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _clientFactory = httpClientFactory;
        }

        public enum TransactionTypeEnum 
        {
            [Display(Name = "Withdraw")]
            withdraw = 100,
            [Display(Name = "Deposit")]
            deposit = 200
        };

        public string TransactionType { get; set; }
        public double TransactionAmount { get; set; }
        public void OnGet()
        {
        }

        public async Task OnPostAsync(string transactionType, double transactionAmount)
        {
            HttpClient client = _clientFactory.CreateClient("ApiClient");
            string transType = transactionType == "100" ? "withdraw" : "deposit";
            var response = await client.PostAsJsonAsync<AccountTransaction>("/transaction",
                new AccountTransaction()
                {
                    TransactionType = transType,
                    TransactionTime = DateTime.Now,
                    Amount= transactionAmount
                });
            string m = response.Content.ReadAsStringAsync().Result;
        }
    }
}
