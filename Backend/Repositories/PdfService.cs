using HRSYS.Repositories;
using Microsoft.AspNetCore.Http;
using System.Text;
using UglyToad.PdfPig;

namespace HRSYS.Repositories
{
    public class PdfService : IPdfService
    {
        public string ExtractTextFromPdf(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            var extractedText = new StringBuilder();

            using (var stream = file.OpenReadStream())
            {
                using (var pdfDocument = PdfDocument.Open(stream))
                {
                    foreach (var page in pdfDocument.GetPages())
                    {
                        extractedText.Append(page.Text);
                        extractedText.Append(" ");
                    }
                }
            }

            return extractedText.ToString();
        }
    }
}