namespace AuthDemo.API
{
    public class AccountDetail
    {
        public AccountDetail(double openingBalance)
        {
            OpeningBalance = openingBalance;
        }

        public AccountDetail(double openingBalance, IEnumerable<AccountTransaction> trans):this( openingBalance)
        {
            foreach(var transaction in trans) { DoTransaction(transaction); }
        }
        public double OpeningBalance { get; private set; }
        public double CurrentBalance { get; private set; }

        private List<AccountTransaction> _transactions= new List<AccountTransaction>();
        public IEnumerable<AccountTransaction> TransactionList { get { return _transactions; } }

        public double DoTransaction(AccountTransaction tran)
        {
            _transactions.Add(tran);
            if (tran.TransactionType == "deposit")
                CurrentBalance += tran.Amount;
            else if (tran.TransactionType == "withdraw")
                CurrentBalance -= tran.Amount;
            return CurrentBalance;
        }
    }

    public class AccountTransaction
    {
        public string? TransactionType { get; set; }
        public DateTime TransactionTime { get; set; }
        public double Amount { get; set; }
    }
}
