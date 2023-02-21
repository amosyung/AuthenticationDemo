using Microsoft.AspNetCore.Authorization;

namespace AuthorizationLibrary
{
    public static class AccessPolicy
    {
        public static void AddCanSubmitTransaction(this AuthorizationOptions options)
        {
            options.AddPolicy("SubmitTransaction", policy => policy.AddRequirements(new CanSubmitTransactionRequirement()));
        }

    }
}