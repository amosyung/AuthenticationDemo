using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Marvel.IDP.Migrations
{
    /// <inheritdoc />
    public partial class addexternallogintouser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ExternalLogins",
                keyColumn: "Id",
                keyValue: new Guid("3440df3c-967b-4c1e-84b1-96b41ede97d8"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("056b8da1-6fe5-4852-80a7-78f669b3d45f"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("08a0b43e-e61e-4fb9-93e1-f85297699fe6"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("14d33550-754c-42fa-84a5-f33c41872723"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("1bce27cc-acb8-4152-b8a2-f18eebe4496b"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("206e0944-bdd8-4034-942a-5bf9c79954d9"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("274e6596-b8c0-40b7-a9ea-098a9f65873c"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("29901673-8143-487a-ba79-e64cf68e97e3"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("33bec90d-5a6d-44ce-a03b-5bc236b52aad"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("3534044d-72de-4779-a44d-8d52e6491d31"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("602f7cdd-f803-4dfb-a38d-d1955aa23d49"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("6dea5e18-d89d-4fde-b016-332e91e75865"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("937338dc-d539-43c2-95ca-94a893fe5c09"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("9c4b46d2-e473-4fd5-8ba7-8124876002b0"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("aa2461cb-dfd8-4315-84b7-feedfd29e736"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("b0310056-7df8-4a25-946b-331f95d8d410"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("b638d744-de53-4785-b177-44a596b42860"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("b8194566-38fa-41cc-a639-be619f780900"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("bb5d86f6-b0ed-4c47-83da-c7bd57d15b3e"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("d0639cfe-050c-41c6-ad6e-5d33d4b6e50b"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("d13792bc-501c-4507-a32f-a80fc06703b9"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("e243cc2b-3573-47b5-8e98-e57df08d9542"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("ffbeb88a-f69f-43e7-898f-c33f9201fd1b"));

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                values: new object[] { new Guid("3440df3c-967b-4c1e-84b1-96b41ede97d8"), "10ea7287-39f4-4a91-8897-25f02fa433b8", "AAD", "3QpPcpy8e6AgExZkiSembDW5U_ITlo8raKLLLZzbsVE", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972") });

            migrationBuilder.InsertData(
                table: "UserClaims",
                columns: new[] { "Id", "ConcurrencyStamp", "Type", "UserId", "Value" },
                values: new object[,]
                {
                    { new Guid("056b8da1-6fe5-4852-80a7-78f669b3d45f"), "a5cacc08-6af3-4852-9996-c51d541dea1d", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "public_market" },
                    { new Guid("08a0b43e-e61e-4fb9-93e1-f85297699fe6"), "c5629e28-8627-4b71-85b2-d62a275b21ca", "employee_classification", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "B10" },
                    { new Guid("14d33550-754c-42fa-84a5-f33c41872723"), "401b17bd-4232-4d91-8421-8d257a8f555f", "role", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "FreeUser" },
                    { new Guid("1bce27cc-acb8-4152-b8a2-f18eebe4496b"), "c09b9817-5c26-434b-9fb8-b766c496e338", "email", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "AliceSmith@email.com" },
                    { new Guid("206e0944-bdd8-4034-942a-5bf9c79954d9"), "b9626255-7426-47b4-b30c-a12962d2a1f6", "birthdate", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "1988-10-14" },
                    { new Guid("274e6596-b8c0-40b7-a9ea-098a9f65873c"), "05dc2d24-61a4-4fae-b9f8-09da222ae778", "nationality", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "British" },
                    { new Guid("29901673-8143-487a-ba79-e64cf68e97e3"), "e9872ce9-401d-4aeb-974c-111b93b5f0de", "given_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "David" },
                    { new Guid("33bec90d-5a6d-44ce-a03b-5bc236b52aad"), "9026ebc5-ceb5-42a7-9d19-551b3cfda9f5", "website", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "http://alice.com" },
                    { new Guid("3534044d-72de-4779-a44d-8d52e6491d31"), "419a9025-4be9-44ec-b017-525d82f9f378", "address", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "" },
                    { new Guid("602f7cdd-f803-4dfb-a38d-d1955aa23d49"), "12dc972f-5288-4d54-a7c0-38daacd435b6", "country", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "be" },
                    { new Guid("6dea5e18-d89d-4fde-b016-332e91e75865"), "31dd2b77-f976-4837-a5ce-8ee7c8c9849a", "given_name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Alice" },
                    { new Guid("937338dc-d539-43c2-95ca-94a893fe5c09"), "ebae07a7-840f-4232-afa2-6d4be4af0df9", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "toronto_au" },
                    { new Guid("9c4b46d2-e473-4fd5-8ba7-8124876002b0"), "8e131977-a03f-4c2c-9f93-c680f4c579b3", "country", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "nl" },
                    { new Guid("aa2461cb-dfd8-4315-84b7-feedfd29e736"), "4d1be39f-0c14-40e0-b832-14e92730e8be", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "auth_demo_tester" },
                    { new Guid("b0310056-7df8-4a25-946b-331f95d8d410"), "d03a8582-525e-4cad-8f20-1a8ebc1984b6", "acl", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "auth_demo_dev" },
                    { new Guid("b638d744-de53-4785-b177-44a596b42860"), "95a504db-fca1-41f3-a87b-aba71f7b61e7", "family_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "Flagg" },
                    { new Guid("b8194566-38fa-41cc-a639-be619f780900"), "811dc2c2-d7c1-4776-a906-cc916b2ac2fe", "family_name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Smith" },
                    { new Guid("bb5d86f6-b0ed-4c47-83da-c7bd57d15b3e"), "e3e1df03-04fd-4d4a-a404-a9771a99d65e", "role", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "PayingUser" },
                    { new Guid("d0639cfe-050c-41c6-ad6e-5d33d4b6e50b"), "62055659-7bca-447c-9336-049ffd90bd57", "family_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Flagg" },
                    { new Guid("d13792bc-501c-4507-a32f-a80fc06703b9"), "d60d7c86-7268-47be-8b52-f47c89e6d669", "name", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "Alice Smith" },
                    { new Guid("e243cc2b-3573-47b5-8e98-e57df08d9542"), "cc64b7cc-8a50-4dd6-9730-27d1ec6dd82d", "given_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Emma" },
                    { new Guid("ffbeb88a-f69f-43e7-898f-c33f9201fd1b"), "fad2176b-baf3-4751-9895-b9af44915480", "email_verified", new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), "true" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"),
                column: "ConcurrencyStamp",
                value: "a2f01608-2736-47f3-8937-09f56649fe10");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"),
                column: "ConcurrencyStamp",
                value: "7ae2883c-3876-41cb-ac6d-f2a669edc877");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33229d33-99e0-41b3-b18d-4f72127e3973"),
                column: "ConcurrencyStamp",
                value: "4dff6115-2dc1-469c-bd71-2fb8324896dd");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("43229d33-99e0-41b3-b18d-4f72127e3974"),
                column: "ConcurrencyStamp",
                value: "7ce13c2e-c48d-41be-a824-18b8c32bc42b");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("53229d33-99e0-41b3-b18d-4f72127e3975"),
                column: "ConcurrencyStamp",
                value: "7b5654cc-53bd-46d4-89c9-bb2bac66127f");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"),
                column: "ConcurrencyStamp",
                value: "d303c2a2-9709-4ac2-9fde-f0b3f0c7d460");
        }
    }
}
