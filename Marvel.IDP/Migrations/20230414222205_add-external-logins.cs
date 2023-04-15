using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Marvel.IDP.Migrations
{
    /// <inheritdoc />
    public partial class addexternallogins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
    }
}
