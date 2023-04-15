using System.ComponentModel.DataAnnotations;
namespace Marvel.IDP.Entities
{
    public class ExternalLogin:IConcurrencyAware
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; }
        
        [Required]
        [MaxLength(10)]
        public string ProviderName { get; set; }

        [Required]
        [MaxLength(100)]
        public string ProviderSubjectId { get; set; }


        [ConcurrencyCheck]
        public string ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString();

    }
}
