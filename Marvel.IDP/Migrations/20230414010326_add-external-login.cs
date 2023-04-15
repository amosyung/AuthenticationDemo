using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Marvel.IDP.Migrations
{
    /// <inheritdoc />
    public partial class addexternallogin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("5a75076b-7e4c-41be-8dc8-e25e6ecd72a5"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("6124206e-f5dd-42cb-a9b3-f2691bf80aec"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("77dfccf9-a6d6-449f-b510-46842ede132c"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("956ec168-b073-444d-8cc1-c68323984ede"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("9d8a1b86-52c9-4b59-b039-e6442bad18bf"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("a3c4d974-1bdc-420a-9d18-0f86d2f69d52"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("b27d7d91-cd0b-4c9f-91af-980a4adacd79"));

            migrationBuilder.DeleteData(
                table: "UserClaims",
                keyColumn: "Id",
                keyValue: new Guid("db8c8e8c-4528-4884-885e-002142ec7d61"));

            migrationBuilder.CreateTable(
                name: "ExternalLogins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProviderName = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ProviderSubjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalLogins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExternalLogins_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_ExternalLogins_UserId",
                table: "ExternalLogins",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExternalLogins");

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
                    { new Guid("5a75076b-7e4c-41be-8dc8-e25e6ecd72a5"), "dca72738-d1e1-4e5c-92be-1545ac81e992", "role", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "FreeUser" },
                    { new Guid("6124206e-f5dd-42cb-a9b3-f2691bf80aec"), "7d35096d-2a9e-4d9a-8d65-14a1c005b10d", "country", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "be" },
                    { new Guid("77dfccf9-a6d6-449f-b510-46842ede132c"), "83c32f4c-ed64-42b5-b3d0-941aab9f5683", "given_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Emma" },
                    { new Guid("956ec168-b073-444d-8cc1-c68323984ede"), "b1050b3f-1b2e-4966-ab45-ca37b48f5c15", "family_name", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "Flagg" },
                    { new Guid("9d8a1b86-52c9-4b59-b039-e6442bad18bf"), "fa6191d4-cf8b-4e79-bfc0-45fdaa7009ff", "role", new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"), "PayingUser" },
                    { new Guid("a3c4d974-1bdc-420a-9d18-0f86d2f69d52"), "d49639a9-3122-40ad-8a08-351fcfa5d059", "family_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "Flagg" },
                    { new Guid("b27d7d91-cd0b-4c9f-91af-980a4adacd79"), "9175621c-ee15-47ee-be16-497bc96526e1", "given_name", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "David" },
                    { new Guid("db8c8e8c-4528-4884-885e-002142ec7d61"), "f4024837-ee5e-46fb-8803-521ed6dbb7fc", "country", new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"), "nl" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("13229d33-99e0-41b3-b18d-4f72127e3971"),
                column: "ConcurrencyStamp",
                value: "11209da1-edfd-4f1a-8041-f766c951a1bd");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("96053525-f4a5-47ee-855e-0ea77fa6c55a"),
                column: "ConcurrencyStamp",
                value: "d2e3da51-c893-4db9-89b5-a92c42ea6177");
        }
    }
}
