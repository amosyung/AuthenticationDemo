using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Marvel.IDP.Migrations
{
    /// <inheritdoc />
    public partial class updateexternallogin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExternalLogins",
                keyColumn: "Id",
                keyValue: new Guid("22190394-366c-498d-adc3-968c45a49514"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("171330a1-1a7c-4686-8a7b-3a4ee76aa876"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("1d3e6a78-0219-4b74-aca1-cf09d1e37ab1"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("348f9038-ddad-4242-aad6-4668e273fe45"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("398d7691-d1a3-4790-b45b-a1736ab5bf3f"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("520a3f12-21f4-41b9-a406-b4e4e379360b"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("564d7f9c-4e2f-4be3-8eb6-c6de6be3b649"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("5c3ef3ad-4312-42af-8c70-ab362c56ec1d"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("5d3b0137-8029-43cb-b10a-e7323f3096f7"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("6a0b074f-7250-4264-bfa1-5d46ad1c7281"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("7268e08c-a854-46b1-82ed-58c63f70ef60"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("7d2823fa-9020-4e5c-8186-c756f156f094"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("8237c50e-e05e-45af-9ea2-4320437c35ba"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("a03ddc4e-75ed-42a9-b44d-1e7d6623e13a"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("a0bf57d8-3d4a-4b0b-8548-0dccd143afaf"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("a52918ed-7d6c-4439-8640-dbd4c9732638"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("c0fd2dd8-dcfd-4064-abb9-0cc659a201cc"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("d4c2a104-74a5-4bf5-ad7b-1b7bf7e59622"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("dbfadbbf-315c-453e-9e1d-80dda4ec1b90"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("e2d82940-9ebd-41cb-abe2-fe34c4d9c182"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("e8b51ef0-d063-4df2-9eee-246bf18c4907"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("f8f23e92-51a0-42a6-a194-bbf70ed59123"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("fe231468-c846-473a-abfa-138826fa7937"));

            migrationBuilder.InsertData(
                table: "ExternalLogins",
                columns: new[] { "Id", "ConcurrencyStamp", "ProviderName", "ProviderSubjectId", "UserId" },
                values: new object[,]
                {
                    { new Guid("0c29cc6f-025d-4112-8080-0f31c0fff5f8"), "84d0696b-2c17-4064-aa32-a5b96c74513e", "Facebook", "4254533717911644", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972") },
                    { new Guid("f41b3b76-9338-4564-a92e-1de542c499de"), "50f227b5-62fd-426b-b21a-790468ad59d7", "AAD", "3QpPcpy8e6AgExZkiSembDW5U_ITlo8raKLLLZzbsVE", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972") }
                });

            migrationBuilder.InsertData(
                table: "UserClaims",
                columns: new[] { "Id", "ConcurrencyStamp", "Type", "UserId", "Value" },
                values: new object[,]
                {
                    { new Guid("0701e048-8c18-4fa4-9c8e-ee8641c2095a"), "dac75c38-c8c9-450d-bb11-53683fe3cfa7", "family_name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Smith" },
                    { new Guid("0a249158-b1b1-4d0e-aa33-ac117e4f939a"), "8b8f2625-89c2-43c9-9f53-fb497227a3a4", "address", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "" },
                    { new Guid("0a74d6a5-1e28-4b93-8a31-29bdbe39440b"), "1127e200-866e-445c-9332-2a44badd9a5f", "name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Alice Smith" },
                    { new Guid("0bb12446-c8e3-44a1-92f3-7c1998d8b131"), "45347489-ca4a-4a9d-8f97-7decc90cb126", "birthdate", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "1988-10-14" },
                    { new Guid("12054669-6a45-4315-a712-5564cd5f128f"), "1cfa6df8-ca03-4dff-a379-d59607d8ff34", "role", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "PayingUser" },
                    { new Guid("1da33f07-670f-4268-b20e-97c77911e765"), "23c8cf9d-02e6-4687-b730-fd051d917eb8", "email_verified", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "true" },
                    { new Guid("282f44a4-cd34-4ad1-8fbc-f01a3f1d04f0"), "3fcc7450-5672-462b-bd16-249f911c9765", "given_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Emma" },
                    { new Guid("2b331a4c-fb91-4479-803c-11ae5793f268"), "16159709-f31d-417b-8842-451ed948950e", "nationality", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "British" },
                    { new Guid("2dff6a57-3621-48e7-b4ee-415a5abfb24e"), "dc177b86-4e90-4e2f-a773-ae3fcc9f51d0", "given_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "David" },
                    { new Guid("3ddeddd2-4ffe-4298-9709-e9cd687c9034"), "ede46112-8b04-41a6-8a5b-ac68ec393043", "given_name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Alice" },
                    { new Guid("4a053c76-d216-4692-8723-e909e9f35ccb"), "bea0fe2e-738f-431b-83b3-ea1ee0ffe782", "role", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "FreeUser" },
                    { new Guid("5477d615-a9bf-469b-abf6-1a1f49330a41"), "adf0c708-61bb-42d7-87bc-7fcef9447160", "country", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "nl" },
                    { new Guid("7b7f31a4-f341-4033-bdad-6afdac7c100d"), "a682742b-c113-4c86-be65-0bbb536cf353", "employee_classification", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "B10" },
                    { new Guid("93c91e2f-826c-4c92-aa3d-e875bc96eb7d"), "612d31ee-d379-4508-8a8b-b0ac6ce451d7", "email", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "AliceSmith@email.com" },
                    { new Guid("966cbd3d-9635-45c1-890f-05885bf3f1a8"), "f369f754-911a-4c9e-9fcb-9432e991fd93", "family_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Flagg" },
                    { new Guid("a7c81d30-3398-418b-bb0f-1b9d1b4b3a60"), "2f38d5b1-99dc-4e1f-ab6f-3b780ade68e8", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "auth_demo_tester" },
                    { new Guid("bc9ac5f8-a22d-4326-821b-3f9bbeff00eb"), "d287a65f-290a-492c-97d7-164a3c3ad457", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "toronto_au" },
                    { new Guid("c5d814ee-8e1d-4139-9e61-e13f327fd95d"), "bc88c7f7-c73a-4c70-9978-ede74852f86f", "family_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "Flagg" },
                    { new Guid("d7f653ee-ba2c-4ca8-979d-2a912bc508e9"), "6c617c8d-a80e-4a2a-aece-3154cce03f5d", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "public_market" },
                    { new Guid("e190e6d6-455a-43e5-8b03-85266f9c9659"), "1f2dcbb9-3409-4f3a-8bb6-e8974134e334", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "auth_demo_dev" },
                    { new Guid("e5e77b85-8ff6-441e-9148-4e0fc6d45604"), "c8870c2e-0b76-4923-8060-8b3e34135d1d", "website", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "http://alice.com" },
                    { new Guid("eb186406-3ee9-492e-9b66-eef1e530c3df"), "0ed4afdd-a82c-4b72-a3a3-c552c0a39535", "country", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "be" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"),
                column: "ConcurrencyStamp",
                value: "3814ddf8-fbf5-47d3-935e-37ef6a3235dc");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"),
                column: "ConcurrencyStamp",
                value: "059d3d89-01d8-459f-ae5d-4c55bdc9b79c");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33229d33-99e0-41b3-b18d-4f72127e3973"),
                column: "ConcurrencyStamp",
                value: "536a2ac8-3487-46b9-9ba9-d7bf41fc066d");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("43229d33-99e0-41b3-b18d-4f72127e3974"),
                column: "ConcurrencyStamp",
                value: "81484745-e53e-45bf-b550-1c1dc641ed5d");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("53229d33-99e0-41b3-b18d-4f72127e3975"),
                column: "ConcurrencyStamp",
                value: "938848d8-3a03-4ab4-baf0-a757586b4e00");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"),
                column: "ConcurrencyStamp",
                value: "e297d6f3-e4d0-4f31-a0b7-0e487072258a");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExternalLogins",
                keyColumn: "Id",
                keyValue: new Guid("0c29cc6f-025d-4112-8080-0f31c0fff5f8"));

            migrationBuilder.DeleteData(
                table: "ExternalLogins",
                keyColumn: "Id",
                keyValue: new Guid("f41b3b76-9338-4564-a92e-1de542c499de"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("0701e048-8c18-4fa4-9c8e-ee8641c2095a"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("0a249158-b1b1-4d0e-aa33-ac117e4f939a"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("0a74d6a5-1e28-4b93-8a31-29bdbe39440b"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("0bb12446-c8e3-44a1-92f3-7c1998d8b131"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("12054669-6a45-4315-a712-5564cd5f128f"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("1da33f07-670f-4268-b20e-97c77911e765"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("282f44a4-cd34-4ad1-8fbc-f01a3f1d04f0"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("2b331a4c-fb91-4479-803c-11ae5793f268"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("2dff6a57-3621-48e7-b4ee-415a5abfb24e"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("3ddeddd2-4ffe-4298-9709-e9cd687c9034"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("4a053c76-d216-4692-8723-e909e9f35ccb"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("5477d615-a9bf-469b-abf6-1a1f49330a41"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("7b7f31a4-f341-4033-bdad-6afdac7c100d"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("93c91e2f-826c-4c92-aa3d-e875bc96eb7d"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("966cbd3d-9635-45c1-890f-05885bf3f1a8"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("a7c81d30-3398-418b-bb0f-1b9d1b4b3a60"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("bc9ac5f8-a22d-4326-821b-3f9bbeff00eb"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("c5d814ee-8e1d-4139-9e61-e13f327fd95d"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("d7f653ee-ba2c-4ca8-979d-2a912bc508e9"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("e190e6d6-455a-43e5-8b03-85266f9c9659"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("e5e77b85-8ff6-441e-9148-4e0fc6d45604"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("eb186406-3ee9-492e-9b66-eef1e530c3df"));

            migrationBuilder.InsertData(
                table: "ExternalLogins",
                columns: new[] { "Id", "ConcurrencyStamp", "ProviderName", "ProviderSubjectId", "UserId" },
                values: new object[] { new Guid("22190394-366c-498d-adc3-968c45a49514"), "c8209abb-dfe4-42d0-9f59-ed17c138c8bd", "AAD", "3QpPcpy8e6AgExZkiSembDW5U_ITlo8raKLLLZzbsVE", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972") });

            migrationBuilder.InsertData(
                table: "UserClaims",
                columns: new[] { "Id", "ConcurrencyStamp", "Type", "UserId", "Value" },
                values: new object[,]
                {
                    { new Guid("171330a1-1a7c-4686-8a7b-3a4ee76aa876"), "b50d7bb4-3135-48e5-b260-6d66fadc5c89", "country", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "nl" },
                    { new Guid("1d3e6a78-0219-4b74-aca1-cf09d1e37ab1"), "0ffee977-d5b8-4cf6-9f0a-b47c819347a1", "email_verified", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "true" },
                    { new Guid("348f9038-ddad-4242-aad6-4668e273fe45"), "f0665579-80d0-4894-a58e-ceb6457789ff", "address", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "" },
                    { new Guid("398d7691-d1a3-4790-b45b-a1736ab5bf3f"), "a6d41d80-2004-44d6-88af-9fc3e96bdb42", "given_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "David" },
                    { new Guid("520a3f12-21f4-41b9-a406-b4e4e379360b"), "a0e87dbb-6dd5-4437-8eb1-76d14941fc50", "family_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "Flagg" },
                    { new Guid("564d7f9c-4e2f-4be3-8eb6-c6de6be3b649"), "7b50129e-e8ba-4461-a72c-4b20c0256f75", "email", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "AliceSmith@email.com" },
                    { new Guid("5c3ef3ad-4312-42af-8c70-ab362c56ec1d"), "060c4ee3-0a60-477d-be79-8bcb7ea8026b", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "auth_demo_tester" },
                    { new Guid("5d3b0137-8029-43cb-b10a-e7323f3096f7"), "7f37a200-88ae-4805-9201-eff742b31453", "name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Alice Smith" },
                    { new Guid("6a0b074f-7250-4264-bfa1-5d46ad1c7281"), "7d53be55-2aa8-4e48-b00b-90fc98d3deaa", "given_name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Alice" },
                    { new Guid("7268e08c-a854-46b1-82ed-58c63f70ef60"), "0b373025-fa17-4e91-ad5a-7078daba35b9", "country", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "be" },
                    { new Guid("7d2823fa-9020-4e5c-8186-c756f156f094"), "3bcf3646-bcae-461d-abb1-a55b10714650", "family_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Flagg" },
                    { new Guid("8237c50e-e05e-45af-9ea2-4320437c35ba"), "004d0260-9593-45e1-8a9d-88b0d29c4cf5", "family_name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Smith" },
                    { new Guid("a03ddc4e-75ed-42a9-b44d-1e7d6623e13a"), "8350f1cf-7994-4a46-b207-e11007f903c9", "role", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "FreeUser" },
                    { new Guid("a0bf57d8-3d4a-4b0b-8548-0dccd143afaf"), "ce12e99f-d788-4671-932c-88beae9d6ddb", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "toronto_au" },
                    { new Guid("a52918ed-7d6c-4439-8640-dbd4c9732638"), "56050713-f2b4-49f1-83a7-076c3c1a19a2", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "auth_demo_dev" },
                    { new Guid("c0fd2dd8-dcfd-4064-abb9-0cc659a201cc"), "23026ecb-ea3d-48a0-bd68-166c6f2760ac", "employee_classification", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "B10" },
                    { new Guid("d4c2a104-74a5-4bf5-ad7b-1b7bf7e59622"), "6863a322-938e-499a-9c9d-93291e04fef2", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "public_market" },
                    { new Guid("dbfadbbf-315c-453e-9e1d-80dda4ec1b90"), "c9786bfe-86c4-433e-ae82-575e3ce7ee07", "website", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "http://alice.com" },
                    { new Guid("e2d82940-9ebd-41cb-abe2-fe34c4d9c182"), "1e484bcd-1bdd-440f-8c6d-243d8cb92103", "birthdate", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "1988-10-14" },
                    { new Guid("e8b51ef0-d063-4df2-9eee-246bf18c4907"), "945491c2-8204-4480-a935-2d94318eb308", "role", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "PayingUser" },
                    { new Guid("f8f23e92-51a0-42a6-a194-bbf70ed59123"), "822f3b78-02f7-42d4-a8ea-ec287bbcc075", "nationality", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "British" },
                    { new Guid("fe231468-c846-473a-abfa-138826fa7937"), "95a645a1-2de7-4bd1-8c80-62d6986258d8", "given_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Emma" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"),
                column: "ConcurrencyStamp",
                value: "0ec4f208-96c7-464c-9980-bccdc1b114f6");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"),
                column: "ConcurrencyStamp",
                value: "d5652652-0c72-4cf8-bbf7-c75be9f1b684");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33229d33-99e0-41b3-b18d-4f72127e3973"),
                column: "ConcurrencyStamp",
                value: "8d5f4e6c-1220-45da-8285-bad259a2f357");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("43229d33-99e0-41b3-b18d-4f72127e3974"),
                column: "ConcurrencyStamp",
                value: "b974de26-8a9f-4d28-a213-a8e304d32cb2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("53229d33-99e0-41b3-b18d-4f72127e3975"),
                column: "ConcurrencyStamp",
                value: "684a0b66-2b91-4bd5-9d71-2ae969ee2f4f");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"),
                column: "ConcurrencyStamp",
                value: "f31afc85-193b-4020-bcbb-901df93cd733");
        }
    }
}
