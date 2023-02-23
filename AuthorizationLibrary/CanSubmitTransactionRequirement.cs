using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Net.Http.Json;
using Newtonsoft.Json;

namespace AuthorizationLibrary
{
    public class CanSubmitTransactionRequirement : AuthorizationHandler<CanSubmitTransactionRequirement>, IAuthorizationRequirement 
    {
        public CanSubmitTransactionRequirement() {}

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, CanSubmitTransactionRequirement requirement)
        {
            bool isPass = false;
            Claim? aclClaim = context.User.Claims.FirstOrDefault(c => c.Type.ToLower() == "acl");
            if (aclClaim != null)
            {
                var aclGroups = JsonConvert.DeserializeObject<List<string>>(aclClaim.Value);
                isPass = aclGroups.Any(g => g == "auth_demo_admin") || (
                    (aclGroups.Any(g => g == "auth_demo_user") && (
                    (aclGroups.Any(g => g == "toronto_au") && (DateTime.Now.Hour >= 9 && DateTime.Now.Hour <= 17)) ||
                    (aclGroups.Any(g => g == "sanjose_au") && (DateTime.Now.Hour >= 11 && DateTime.Now.Hour <= 19))
                    )));
            }
            if (isPass)
                context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }

    public class CanSubmitTransactionRequirement2 : AuthorizationHandler<CanSubmitTransactionRequirement2>, IAuthorizationRequirement
    {
        public CanSubmitTransactionRequirement2() { }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, CanSubmitTransactionRequirement2 requirement)
        {
            bool isPass = false;
            IEnumerable< Claim> aclClaims = context.User.Claims.Where(c => c.Type.ToLower() == "acl");
            if (aclClaims.Count() > 0)
            {
                var aclGroups = aclClaims.Select(c => c.Value).ToList();
                //var aclGroups = JsonConvert.DeserializeObject<List<string>>(aclClaim.Value);
                isPass = aclGroups.Any(g => g == "auth_demo_admin") || (
                    (aclGroups.Any(g => g == "auth_demo_user") && (
                    (aclGroups.Any(g => g == "toronto_au") && (DateTime.Now.Hour >= 9 && DateTime.Now.Hour <= 17)) ||
                    (aclGroups.Any(g => g == "sanjose_au") && (DateTime.Now.Hour >= 11 && DateTime.Now.Hour <= 19))
                    )));
            }
            if (isPass)
                context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }
}
