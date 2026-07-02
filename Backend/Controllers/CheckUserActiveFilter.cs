using HRSYS.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

public class CheckUserActiveFilter : IAsyncActionFilter
{
    private readonly AppDbContext _context;

    public CheckUserActiveFilter(AppDbContext context)
    {
        _context = context;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? context.HttpContext.User.FindFirst("id")?.Value;

        if (userIdClaim != null && int.TryParse(userIdClaim, out int userId))
        {
            var userActiveStatus = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => u.IsActive)
                .FirstOrDefaultAsync();

            if (!userActiveStatus)
            {
                context.Result = new ObjectResult(new { message = "عذراً، تم تجميد حسابك من قبل الإدارة." })
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                return; 
            }
        }

        await next(); 
    }
}