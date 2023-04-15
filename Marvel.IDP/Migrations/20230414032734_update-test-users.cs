using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Marvel.IDP.Migrations
{
    /// <inheritdoc />
    public partial class updatetestusers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("33c92892-ba97-4373-af31-03ae704fd0cd"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("64ea35df-1b5c-4f78-b096-4ea0cde435b5"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("88bcf295-c0fa-4023-b122-1e6b76adf1a9"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("b8926357-1ea7-451f-a80d-84d7ee7f9111"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("d8ae0574-4d63-4605-b49f-2eaaa47b628f"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("d967b3eb-eef6-49c1-abf1-318ff0775acf"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("e851aef5-e9ac-4214-b0ca-4d603028000d"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("fbc0c8b1-93af-4f66-a881-8513ad08d5a5"));

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
                keyValue: new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"),
                column: "ConcurrencyStamp",
                value: "5600f81c-f6cc-4ca2-bdd3-985217667452");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Active", "ConcurrencyStamp", "Password", "Subject", "UserName" },
                values: new object[,]
                {
                    { new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"), true, "86b33926-72a8-41fa-978f-0b0a1368aac1", "", "mx001", "alice" },
                    { new Guid("33229d33-99e0-41b3-b18d-4f72127e3973"), true, "852367e5-34a5-423b-92d5-adc915322410", "", "mx002", "bob" },
                    { new Guid("43229d33-99e0-41b3-b18d-4f72127e3974"), true, "186b0d81-ce36-44bf-bf6d-a7b3a63efee3", "", "mx003", "dave" },
                    { new Guid("53229d33-99e0-41b3-b18d-4f72127e3975"), true, "8df05d1b-72f2-4eec-a39f-b1a513781152", "", "mx004", "amos" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("23229d33-99e0-41b3-b18d-4f72127e3972"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33229d33-99e0-41b3-b18d-4f72127e3973"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("43229d33-99e0-41b3-b18d-4f72127e3974"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("53229d33-99e0-41b3-b18d-4f72127e3975"));

            migrationBuilder.InsertData(
                table: "UserClaims",
                columns: new[] { "Id", "ConcurrencyStamp", "Type", "UserId", "Value" },
                values: new object[,]
                {
                    { new Guid("33c92892-ba97-4373-af31-03ae704fd0cd"), "014d5327-8666-4551-becd-6cc6cfec6671", "role", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "PayingUser" },
                    { new Guid("64ea35df-1b5c-4f78-b096-4ea0cde435b5"), "68f7cad0-9a6e-43c6-aa4d-94a280c2a83f", "country", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "nl" },
                    { new Guid("88bcf295-c0fa-4023-b122-1e6b76adf1a9"), "22e9fdc8-1170-4e97-aad6-c96b4bafda1d", "role", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "FreeUser" },
                    { new Guid("b8926357-1ea7-451f-a80d-84d7ee7f9111"), "5dcc1d63-39d3-44bd-a906-05a25dc8284b", "family_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Flagg" },
                    { new Guid("d8ae0574-4d63-4605-b49f-2eaaa47b628f"), "f2d26fb0-3efa-4d75-ae3b-c81ba9d40004", "family_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "Flagg" },
                    { new Guid("d967b3eb-eef6-49c1-abf1-318ff0775acf"), "e01bb274-0b7b-418e-a152-a9adf6dcf0b7", "given_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "David" },
                    { new Guid("e851aef5-e9ac-4214-b0ca-4d603028000d"), "99c3ee21-de5f-4926-9ec1-0e486507ed59", "given_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Emma" },
                    { new Guid("fbc0c8b1-93af-4f66-a881-8513ad08d5a5"), "cf7aa2cb-13a8-49fe-8108-32c6e495fbe9", "country", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "be" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"),
                column: "ConcurrencyStamp",
                value: "6e2e1d3c-e4e9-4c12-a984-20539a963158");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"),
                column: "ConcurrencyStamp",
                value: "5c4ce197-8b44-421e-9d05-d76038fc5330");
        }
    }
}
