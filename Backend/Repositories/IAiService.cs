namespace HRSYS.Repositories
{
    public interface IAiService
    {
        Task<string> AnalyzeResumeAsync(string resumeText);
    }
}