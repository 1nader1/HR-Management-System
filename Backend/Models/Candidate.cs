using System.ComponentModel.DataAnnotations;

namespace HRSYS.Models
{
    public class Candidate
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        public string AppliedPosition { get; set; } = string.Empty;

        public int MatchScore { get; set; }

        public string AiFeedback { get; set; } = string.Empty;

        public DateTime AppliedDate { get; set; } = DateTime.Now;
    }
}