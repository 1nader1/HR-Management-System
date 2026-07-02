using HRSYS.Repositories;
using System.Text;
using System.Text.Json;

namespace HRSYS.Repositories
{
    public class LocalAiService : IAiService
    {
        private readonly HttpClient _httpClient;

        public LocalAiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> AnalyzeResumeAsync(string resumeText)
        {
            // ollama API endpoint for local model inference
            var endpoint = "http://localhost:11434/api/generate";

            var systemInstruction = "You are an expert HR Applicant Tracking System (ATS). " +
                                    "Analyze the provided resume text against modern software development roles. " +
                                    "Extract the candidate's full name, email, and determine a MatchScore from 0 to 100 based on their skills. " +
                                    "Provide a detailed professional feedback summary in Arabic listing strengths and missing core skills. " +
                                    "You MUST respond ONLY with a strict raw JSON object.";

            var requestBody = new
            {
                model = "gemma:2b",
                prompt = @"You are a strict HR Applicant Tracking System (ATS). Analyze the following Candidate Resume.
                        1. Extract FullName.
                        2. Extract Email.
                        3. Extract AppliedPosition.
                        4. Calculate a REALISTIC MatchScore (integer from 0 to 100) based on the candidate's actual skills.
                        5. Write a helpful AiFeedback paragraph explaining why they got this score, mentioning their strengths and missing skills.

                        You MUST respond with a valid JSON object ONLY, using exactly these keys with your dynamically generated values:
                        {
                            ""FullName"": ""string"",
                            ""Email"": ""string"",
                            ""AppliedPosition"": ""string"",
                            ""MatchScore"": 0,
                            ""AiFeedback"": ""string""
                        }

                        Candidate Resume:
                        " + resumeText,
                            stream = false,
                            format = "json"
                        };

            var jsonPayload = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(endpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorDetails = await response.Content.ReadAsStringAsync();
                throw new Exception($"Local AI Error [{response.StatusCode}]: {errorDetails}");
            }

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);

            var aiRawText = doc.RootElement.GetProperty("response").GetString();

            return aiRawText ?? string.Empty;
        }
    }
}