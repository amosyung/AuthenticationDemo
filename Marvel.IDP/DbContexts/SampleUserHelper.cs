using IdentityModel;
using Marvel.IDP.Entities;

namespace Marvel.IDP.DbContexts
{
    public static class SampleUserHelper
    {
        public static List<User> GetSampleUsers()
        {
            var users = new List<User>();
            users.Add(new User()
            {
                Id = new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"),
                Password = "",
                Subject = "mx001",
                UserName = "alice",
                Active = true
            });
            users.Add(new User()
            {
                Id = new Guid("33229d33-99e0-41b3-b18d-4f72127e3973"),
                Password = "",
                Subject = "mx002",
                UserName = "bob",
                Active = true
            });
            users.Add(new User()
            {
                Id = new Guid("43229d33-99e0-41b3-b18d-4f72127e3974"),
                Password = "",
                Subject = "mx003",
                UserName = "dave",
                Active = true
            });
            users.Add(new User()
            {
                Id = new Guid("53229d33-99e0-41b3-b18d-4f72127e3975"),
                Password = "",
                Subject = "mx004",
                UserName = "amos",
                Active = true
            });
            return users;
        }

        public static List<UserClaim> GetSampleUserClaims()
        {
            Func<string, string[], string[], List<UserClaim>> createUserClaims = (userId, types, values) => {
                var claims = new List<UserClaim>();
                for(int i = 0; i < types.Length; i++)
                {
                    claims.Add(new UserClaim()
                    {
                        Id = Guid.NewGuid(),
                        UserId = new Guid(userId),
                        Type = types[i],
                        Value = values[i]
                    });
                }
                return claims;
            };
            var claims = new List<UserClaim>();
            var userClaims = createUserClaims("23229d33-99e0-41b3-b18d-4f72127e3972",
                new string[] { 
                    JwtClaimTypes.Name, JwtClaimTypes.GivenName, JwtClaimTypes.FamilyName, JwtClaimTypes.Email,
                    JwtClaimTypes.EmailVerified, JwtClaimTypes.WebSite, JwtClaimTypes.Address,
                    "employee_classification", JwtClaimTypes.BirthDate, "nationality",
                    "acl","acl","acl","acl"
                },
                new string[] { "Alice Smith", "Alice", "Smith", "AliceSmith@email.com",
                "true", "http://alice.com", "",
                    "B10", "1988-10-14", "British",
                    "toronto_au","public_market", "auth_demo_dev", "auth_demo_tester"
                });
            userClaims.ForEach(c => claims.Add(c));

            return claims;
        }

        public static List<ExternalLogin> GetSampleExternalLogins()
        {
            return new List<ExternalLogin>
            {
                new ExternalLogin()
                {
                    Id = Guid.NewGuid(),
                    UserId = new Guid( "23229d33-99e0-41b3-b18d-4f72127e3972"),
                    ProviderName = "AAD",
                    ProviderSubjectId = "3QpPcpy8e6AgExZkiSembDW5U_ITlo8raKLLLZzbsVE"
                }
            };
        }

    }
}
