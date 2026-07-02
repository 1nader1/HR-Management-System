using HRSYS.Repositories;
using System.Text;
using System.Text.Json;

namespace HRSYS.Repositories
{
    public class GeminiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini API Key is missing.");
        }

        public async Task<string> AnalyzeResumeAsync(string resumeText)
        {

            var endpoint = $"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={_apiKey.Trim()}";

            var systemInstruction = "You are an expert HR Applicant Tracking System (ATS). " +
                                    "Analyze the provided resume text against modern software development roles. " +
                                    "Extract the candidate's full name, email, and determine a MatchScore from 0 to 100 based on their skills. " +
                                    "Provide a detailed professional feedback summary in Arabic listing strengths and missing core skills. " +
                                    "You MUST respond ONLY with a strict raw JSON object, without markdown blocks or code formatting wrappers. " +
                                    "The JSON schema must strictly match: {\"FullName\": \"\", \"Email\": \"\", \"AppliedPosition\": \"\", \"MatchScore\": 85, \"AiFeedback\": \"\"}";

            var requestBody = new
            {
                contents = new[]
                {
            new { parts = new[] { new { text = $"{systemInstruction}\n\nCandidate Resume:\n{resumeText}" } } }
        }
            };

            var jsonPayload = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(endpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var googleErrorDetails = await response.Content.ReadAsStringAsync();
                throw new Exception($"Google API Error [{response.StatusCode}]: {googleErrorDetails}");
            }

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);

            var aiRawText = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return aiRawText ?? string.Empty;
        }
    }
}