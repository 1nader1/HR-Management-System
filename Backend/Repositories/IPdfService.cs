using Microsoft.AspNetCore.Http;

namespace HRSYS.Repositories
{
    public interface IPdfService
    {
        string ExtractTextFromPdf(IFormFile file);
    }
}