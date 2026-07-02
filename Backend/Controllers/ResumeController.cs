using HRSYS.Data;
using HRSYS.Models;
using HRSYS.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HRSYS.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ResumeController : ControllerBase
    {
        private readonly IPdfService _pdfService;
        private readonly IAiService _aiService;
        private readonly AppDbContext _context;

        public ResumeController(IPdfService pdfService, IAiService aiService, AppDbContext context)
        {
            _pdfService = pdfService;
            _aiService = aiService;
            _context = context;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadAndAnalyze(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please upload a valid PDF file.");

            if (file.ContentType != "application/pdf")
                return BadRequest("Only PDF files are allowed.");

            var extractedText = _pdfService.ExtractTextFromPdf(file);
            if (string.IsNullOrWhiteSpace(extractedText))
                return BadRequest("Could not extract text from the PDF.");

            try
            {
                var aiJsonResponse = await _aiService.AnalyzeResumeAsync(extractedText);

                var candidateData = JsonSerializer.Deserialize<Candidate>(aiJsonResponse);

                if (candidateData != null)
                {
                    _context.Candidates.Add(candidateData);
                    await _context.SaveChangesAsync();
                    return Ok(candidateData);
                }

                return BadRequest("Failed to parse AI response.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error during analysis: {ex.Message}");
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllCandidates()
        {
            try
            {
                var candidates = await _context.Candidates
                    .AsNoTracking()
                    .OrderByDescending(c => c.MatchScore)
                    .ToListAsync();

                return Ok(candidates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCandidate(int id)
        {
            try
            {
                var candidate = await _context.Candidates.FindAsync(id);
                if (candidate == null)
                    return NotFound($"Candidate with ID {id} not found.");

                _context.Candidates.Remove(candidate);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Candidate deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}