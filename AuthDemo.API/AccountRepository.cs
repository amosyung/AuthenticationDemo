namespace AuthDemo.API
{
    public class AccountRepository: IAccountRepository
    {
        private Dictionary<string, AccountDetail> _accountDetails = new Dictionary<string, AccountDetail>();
        public AccountRepository() 
        {
            AccountDetail detail = new AccountDetail(6231, new AccountTransaction[]
            {
                new AccountTransaction(){ TransactionType ="deposit", Amount= 120, TransactionTime = Convert.ToDateTime("2022-04-08")},
                new AccountTransaction(){ TransactionType ="deposit", Amount= 2100, TransactionTime = Convert.ToDateTime("2022-04-09")},
                new AccountTransaction(){ TransactionType ="withdraw", Amount= 865, TransactionTime = Convert.ToDateTime("2022-04-15")}
            });
            _accountDetails.Add("alice", detail);
            detail = new AccountDetail(35980, new AccountTransaction[]
            {
                new AccountTransaction(){ TransactionType ="withdraw", Amount= 980, TransactionTime = Convert.ToDateTime("2022-04-08")},
                new AccountTransaction(){ TransactionType ="withdraw", Amount= 2345, TransactionTime = Convert.ToDateTime("2022-04-09")},
                new AccountTransaction(){ TransactionType ="deposit", Amount= 2560, TransactionTime = Convert.ToDateTime("2022-04-15")}
            });
            _accountDetails.Add("bob", detail);
        }

        public AccountDetail GetAccount(string id)
        {
            return _accountDetails[id];
        }

        public double ProcessTransaction(string id, AccountTransaction tran)
        {
            AccountDetail acct = GetAccount(id);
            acct.DoTransaction(tran);
            return acct.CurrentBalance;
        }
    }

    public interface IAccountRepository
    {
        AccountDetail GetAccount(string id);
        double ProcessTransaction(string id, AccountTransaction tran);
    }
}

