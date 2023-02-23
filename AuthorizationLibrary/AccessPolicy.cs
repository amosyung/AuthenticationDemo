using Microsoft.AspNetCore.Authorization;

namespace AuthorizationLibrary
{
    public static class AccessPolicy
    {
        //The purpose of these two functions are exactly the same. Just utilizing the requirement slightly differently.
        //The syntax of using these two functions are also going to be slightly different but they will 
        //accomplish the same thing in different ways.
        //
        //At this point the implementation of the policy is very clunky. The access token resolved into
        //claims in different ways between the UI and the API.
        //On the UI side the acl claims were resolved into a single claim storing an array "acl: ['admin', 'toronto', 'public_market' ]"
        //But the API side they were resolved into multiple claims "acl: admin, acl:toronto, acl:public_market"
        //So at this point we will simply have two policies for different usage. In the future session we will 
        //fix this problem.
      
        public static void CanSubmitTransaction(this AuthorizationOptions options)
        {
            options.AddPolicy("SubmitTransaction", policy => policy.AddRequirements(new CanSubmitTransactionRequirement()));
        }

        public static AuthorizationPolicy CanSubmitTransactionPolicy()
        {
            return new AuthorizationPolicyBuilder()
                .AddRequirements(new CanSubmitTransactionRequirement())
                .Build();
        }

        public static AuthorizationPolicy CanSubmitTransactionPolicy2()
        {
            return new AuthorizationPolicyBuilder()
                .AddRequirements(new CanSubmitTransactionRequirement2())
                .Build();
        }

    }
}