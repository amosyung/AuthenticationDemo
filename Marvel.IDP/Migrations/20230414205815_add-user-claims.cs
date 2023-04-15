using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Marvel.IDP.Migrations
{
    /// <inheritdoc />
    public partial class adduserclaims : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("0b28af70-aa59-4fa1-9e7c-eef38f60712f"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("14178f66-75b1-4a79-89a8-ac2e3f227d91"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("4bc93cda-0e28-4ed1-8aa5-414d470100aa"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("4e929b49-2134-4ed3-bd04-46305f0646e2"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("53b01c7d-d1b1-47a2-b58d-8fe9b77c5bd6"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("89792456-0488-4ac8-9750-4e6ff4a5ccda"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("e12d32b7-1aa2-4cc5-8b62-54dac819e688"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("fbcc0e6d-0fad-4bfd-9ca4-6a21f0b64331"));

            migrationBuilder.InsertData(
                table: "UserClaims",
                columns: new[] { "Id", "ConcurrencyStamp", "Type", "UserId", "Value" },
                values: new object[,]
                {
                    { new Guid("0691f068-913b-4f0c-a3b6-a10bb8797b4b"), "81a1ec97-0d18-4038-9ba2-41bc6f1c3c78", "family_name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Smith" },
                    { new Guid("09c20db4-8cf0-4c3d-a795-d4b412ed2bf9"), "62778c9f-839e-41a4-a05b-510a8fc284d6", "country", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "nl" },
                    { new Guid("0c736eaa-3738-4df6-8095-e7b28e43d05c"), "6340629a-cc87-4df1-8513-0a4f57c6ae65", "address", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "" },
                    { new Guid("12107986-4503-4ead-aed8-004d4a0bde4d"), "dfc7155e-2cc6-4251-9842-d14bcd9955a3", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "toronto_au" },
                    { new Guid("397e2a95-7980-46a0-babc-69a5cb8043e5"), "b172da13-14fc-40df-a629-f59e2b734852", "country", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "be" },
                    { new Guid("3e59d568-b141-4593-b0ec-f9966c3e7ce1"), "dcba92ea-bb53-44ba-8756-465dd7f9cc3e", "given_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Emma" },
                    { new Guid("45cca771-70d4-4dd1-8f67-eb8d101e261a"), "5af7f50d-6e28-4648-b1b4-6e830b09d0c6", "birthdate", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "1988-10-14" },
                    { new Guid("4b367b89-a354-417a-adbf-39653a2fe6a6"), "7de29270-9e0e-4225-93ea-2970b8732c43", "nationality", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "British" },
                    { new Guid("4fca29fb-4832-4f09-aa95-24a04198fbde"), "e076aede-68de-4a08-a406-3756ac276aff", "family_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "Flagg" },
                    { new Guid("518a4883-eebc-4030-af6c-ad86d18a547c"), "14b0a144-2a12-4e32-87bd-a9d70e9fbdd6", "website", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "http://alice.com" },
                    { new Guid("564f3ab0-c40b-4d49-81db-7379111f3dcb"), "4c3ac20a-683e-4df1-aa16-ae4321e3570e", "given_name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Alice" },
                    { new Guid("6031ba20-da05-4bd3-b956-bedcce885636"), "aa581178-eac5-48a5-aee4-bc29b5927472", "email_verified", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "true" },
                    { new Guid("6c634e64-3479-46f4-b92b-fbb2cb873dc5"), "6dd6da31-0e39-4351-ae44-6c9ca9df83bd", "employee_classification", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "B10" },
                    { new Guid("7079f23b-d72e-4c5a-9d7c-744141e4b39d"), "487aa4cc-9a8c-4959-b1bd-3141c2414a3f", "family_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Flagg" },
                    { new Guid("8483d98a-3af1-49de-9053-4320b9bea865"), "977286bd-86b3-49cf-88f7-6ee0c9349363", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "auth_demo_dev" },
                    { new Guid("af36df1c-21d1-484c-b83b-ea9020fdd4fd"), "acf5dd9d-c5a7-4d81-9d87-e79b217b266e", "name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Alice Smith" },
                    { new Guid("b49dc3c6-e229-4c7d-8172-ffa43fca7f55"), "f1e1a880-9823-45f0-929d-a7bf4264b26c", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "public_market" },
                    { new Guid("c954e3db-7303-4e7d-bb1b-6258add1a8d5"), "286f0edf-f6e5-4b19-a52d-c9578f12d634", "role", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "PayingUser" },
                    { new Guid("cf1a7b30-9860-4d27-86bf-5cf7724edf1a"), "27df3740-b2b0-456f-b431-315d25306274", "given_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "David" },
                    { new Guid("dcad780d-1e2d-4f7f-9ee5-ddc8210b3fe8"), "9a21890e-3275-42b1-a740-8058df22fe4c", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "auth_demo_tester" },
                    { new Guid("e74b57c8-1ee8-43f4-8271-fc9c7c4b2c52"), "38716664-dafa-48a3-8d4c-c5b961d518ce", "email", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "AliceSmith@email.com" },
                    { new Guid("f335a108-3b1a-47e3-bd8c-709b18815c7e"), "4c7e325f-ab70-4673-a0e1-000efffa5c39", "role", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "FreeUser" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"),
                column: "ConcurrencyStamp",
                value: "31b39c8a-4c0e-4302-ae40-630184cf56b4");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"),
                column: "ConcurrencyStamp",
                value: "4c7011c7-5830-4909-b8df-262901837df0");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33229d33-99e0-41b3-b18d-4f72127e3973"),
                column: "ConcurrencyStamp",
                value: "6bcf7420-a76f-4ded-86bc-da006e6b9591");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("43229d33-99e0-41b3-b18d-4f72127e3974"),
                column: "ConcurrencyStamp",
                value: "b78a319e-019b-4531-9a0e-58707f518c8d");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("53229d33-99e0-41b3-b18d-4f72127e3975"),
                column: "ConcurrencyStamp",
                value: "244c23cc-c6c1-4d87-a155-355b4cf7b40f");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"),
                column: "ConcurrencyStamp",
                value: "16221cce-668f-4b65-bb94-e6353d459d01");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("0691f068-913b-4f0c-a3b6-a10bb8797b4b"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("09c20db4-8cf0-4c3d-a795-d4b412ed2bf9"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("0c736eaa-3738-4df6-8095-e7b28e43d05c"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("12107986-4503-4ead-aed8-004d4a0bde4d"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("397e2a95-7980-46a0-babc-69a5cb8043e5"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("3e59d568-b141-4593-b0ec-f9966c3e7ce1"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("45cca771-70d4-4dd1-8f67-eb8d101e261a"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("4b367b89-a354-417a-adbf-39653a2fe6a6"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("4fca29fb-4832-4f09-aa95-24a04198fbde"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("518a4883-eebc-4030-af6c-ad86d18a547c"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("564f3ab0-c40b-4d49-81db-7379111f3dcb"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("6031ba20-da05-4bd3-b956-bedcce885636"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("6c634e64-3479-46f4-b92b-fbb2cb873dc5"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("7079f23b-d72e-4c5a-9d7c-744141e4b39d"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("8483d98a-3af1-49de-9053-4320b9bea865"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("af36df1c-21d1-484c-b83b-ea9020fdd4fd"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("b49dc3c6-e229-4c7d-8172-ffa43fca7f55"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("c954e3db-7303-4e7d-bb1b-6258add1a8d5"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("cf1a7b30-9860-4d27-86bf-5cf7724edf1a"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("dcad780d-1e2d-4f7f-9ee5-ddc8210b3fe8"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("e74b57c8-1ee8-43f4-8271-fc9c7c4b2c52"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("f335a108-3b1a-47e3-bd8c-709b18815c7e"));

            migrationBuilder.InsertData(
                table: "UserClaims",
                columns: new[] { "Id", "ConcurrencyStamp", "Type", "UserId", "Value" },
                values: new object[,]
                {
                    { new Guid("0b28af70-aa59-4fa1-9e7c-eef38f60712f"), "1eeb33d0-e50e-4bae-9eaf-8f2cd101cc26", "given_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Emma" },
                    { new Guid("14178f66-75b1-4a79-89a8-ac2e3f227d91"), "eaea0d4a-39ab-4648-9709-4a08abc54280", "family_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Flagg" },
                    { new Guid("4bc93cda-0e28-4ed1-8aa5-414d470100aa"), "39708d4d-d1de-44f2-9353-0889268e9366", "country", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "nl" },
                    { new Guid("4e929b49-2134-4ed3-bd04-46305f0646e2"), "b061662c-dab6-4987-b333-a861092b8f3a", "role", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "PayingUser" },
                    { new Guid("53b01c7d-d1b1-47a2-b58d-8fe9b77c5bd6"), "99110d24-b57f-4e2a-bec0-c7dd54a76963", "given_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "David" },
                    { new Guid("89792456-0488-4ac8-9750-4e6ff4a5ccda"), "cfabb397-97e6-42d8-8124-c886eb2c2022", "family_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "Flagg" },
                    { new Guid("e12d32b7-1aa2-4cc5-8b62-54dac819e688"), "21518834-290f-4efc-80bf-d9121fecec76", "role", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "FreeUser" },
                    { new Guid("fbcc0e6d-0fad-4bfd-9ca4-6a21f0b64331"), "75afcc20-ecb4-497f-9e35-a48ab5eb2f1b", "country", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "be" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"),
                column: "ConcurrencyStamp",
                value: "04351399-1b19-4933-a260-82c187a14d92");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"),
                column: "ConcurrencyStamp",
                value: "86b33926-72a8-41fa-978f-0b0a1368aac1");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33229d33-99e0-41b3-b18d-4f72127e3973"),
                column: "ConcurrencyStamp",
                value: "852367e5-34a5-423b-92d5-adc915322410");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("43229d33-99e0-41b3-b18d-4f72127e3974"),
                column: "ConcurrencyStamp",
                value: "186b0d81-ce36-44bf-bf6d-a7b3a63efee3");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("53229d33-99e0-41b3-b18d-4f72127e3975"),
                column: "ConcurrencyStamp",
                value: "8df05d1b-72f2-4eec-a39f-b1a513781152");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"),
                column: "ConcurrencyStamp",
                value: "5600f81c-f6cc-4ca2-bdd3-985217667452");
        }
    }
}
