// Copyright (c) Duende Software. All rights reserved.
// See LICENSE in the project root for license information.


using IdentityModel;
using System.Security.Claims;
using System.Text.Json;
using Duende.IdentityServer;
using Duende.IdentityServer.Test;

namespace Marvel.IDP;

public class TestUsers
{
    /*
    public static List<TestUser> Users
    {
        get
        {
            var address = new
            {
                street_address = "One Hacker Way",
                locality = "Heidelberg",
                postal_code = 69118,
                country = "Germany"
            };

            return new List<TestUser>
            {
                new TestUser
                {
                    SubjectId = "mx001",
                    Username = "alice",
                    Password = "alice",
                    ProviderName = "AAD",
                    ProviderSubjectId = "3QpPcpy8e6AgExZkiSembDW5U_ITlo8raKLLLZzbsVE",
                    Claims =
                    {
                        new Claim(JwtClaimTypes.Name, "Alice Smith"),
                        new Claim(JwtClaimTypes.GivenName, "Alice"),
                        new Claim(JwtClaimTypes.FamilyName, "Smith"),
                        new Claim(JwtClaimTypes.Email, "AliceSmith@email.com"),
                        new Claim(JwtClaimTypes.EmailVerified, "true", ClaimValueTypes.Boolean),
                        new Claim(JwtClaimTypes.WebSite, "http://alice.com"),
                        new Claim(JwtClaimTypes.Address, JsonSerializer.Serialize(address), IdentityServerConstants.ClaimValueTypes.Json),
                        new Claim("employee_classification", "B10"), //this claim will be mapped to role on the client side
                        new Claim(JwtClaimTypes.BirthDate, "1988-10-14"),
                        new Claim("nationality", "British"),                        
                        new Claim("acl", "toronto_au"),
                        new Claim("acl", "public_market"),
                        new Claim("acl", "auth_demo_dev"),
                        new Claim("acl", "auth_demo_tester")
                    }
                },
                new TestUser
                {
                    SubjectId = "mx002",
                    Username = "bob",
                    Password = "bob",
                    Claims =
                    {
                        new Claim(JwtClaimTypes.Name, "Bob Smith"),
                        new Claim(JwtClaimTypes.GivenName, "Bob"),
                        new Claim(JwtClaimTypes.FamilyName, "Smith"),
                        new Claim(JwtClaimTypes.Email, "BobSmith@email.com"),
                        new Claim(JwtClaimTypes.EmailVerified, "true", ClaimValueTypes.Boolean),
                        new Claim(JwtClaimTypes.WebSite, "http://bob.com"),
                        new Claim(JwtClaimTypes.Address, JsonSerializer.Serialize(address), IdentityServerConstants.ClaimValueTypes.Json),
                        new Claim("employee_classification", "B11"), //this claim will be mapped to role on the client side
                        new Claim(JwtClaimTypes.BirthDate, "2001-09-02"),
                        new Claim("nationality", "American"),
                        new Claim("acl", "boston_au"),
                        new Claim("acl", "private_market"),
                        new Claim("acl", "auth_demo_user")
                    }
                },
                new TestUser
                {
                    SubjectId = "mx003",
                    Username = "dave",
                    Password = "dave",
                    Claims =
                    {
                        new Claim(JwtClaimTypes.Name, "Dave Jones"),
                        new Claim(JwtClaimTypes.GivenName, "Dave"),
                        new Claim(JwtClaimTypes.FamilyName, "Jones"),
                        new Claim(JwtClaimTypes.Email, "DaveJones@email.com"),
                        new Claim(JwtClaimTypes.EmailVerified, "true", ClaimValueTypes.Boolean),
                        new Claim(JwtClaimTypes.WebSite, "http://dave.com"),
                        new Claim(JwtClaimTypes.Address, JsonSerializer.Serialize(address), IdentityServerConstants.ClaimValueTypes.Json),
                        new Claim("employee_classification", "test subject"), //this claim will be mapped to role on the client side
                        new Claim(JwtClaimTypes.BirthDate, "1987-05-13"),
                        new Claim("nationality", "Jamaican"),
                        new Claim("acl", "sanjose_au"),
                        new Claim("acl", "private_market"),
                        new Claim("acl", "auth_demo_user")                    
                    }
                },
                new TestUser
                {
                    SubjectId = "mx004",
                    Username = "amos",
                    Password = "amos",
                    Claims =
                    {
                        new Claim(JwtClaimTypes.Name, "Amos Yung"),
                        new Claim(JwtClaimTypes.GivenName, "Amos"),
                        new Claim(JwtClaimTypes.FamilyName, "Yung"),
                        new Claim(JwtClaimTypes.Email, "Amos@email.com"),
                        new Claim(JwtClaimTypes.EmailVerified, "true", ClaimValueTypes.Boolean),
                        new Claim(JwtClaimTypes.WebSite, "http://dave.com"),
                        new Claim(JwtClaimTypes.Address, JsonSerializer.Serialize(address), IdentityServerConstants.ClaimValueTypes.Json),
                        new Claim("employee_classification", "B10"), //this claim will be mapped to role on the client side
                        new Claim(JwtClaimTypes.BirthDate, "1976-12-01"),
                        new Claim("nationality", "Canadian"),
                        new Claim("acl", "toronto_au"),
                        new Claim("acl", "public_market"),
                        new Claim("acl", "auth_demo_dev"),
                        new Claim("acl", "auth_demo_admin")
                    }
                }
            };
        }
    }

    public static TestUserStore CreateTestUserStore()
    {
        TestUserStore store = new TestUserStore(TestUsers.Users);

        return store;
    }*/
}