using HRSYS.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace YourProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Owner,Manager")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .AsNoTracking()
                    .Select(u => new
                    {
                        u.Id,
                        u.Name,
                        u.Email,
                        u.Role,
                        u.IsActive
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "حدث خطأ في السيرفر", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });

            if (user.Role == "Owner")
                return BadRequest(new { message = "عملية مرفوضة: لا يمكن حذف مالك النظام الأساسي!" });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم حذف المستخدم بنجاح." });
        }

        [HttpPut("toggle-status/{id}")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });

            if (user.Role == "Owner")
                return BadRequest(new { message = "عملية مرفوضة: لا يمكن تجميد حساب مالك النظام!" });

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { message = user.IsActive ? "تم تفعيل الحساب بنجاح." : "تم تجميد الحساب بنجاح." });
        }

        [HttpPut("change-role/{id}")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleDto request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });

            if (user.Role == "Owner")
                return BadRequest(new { message = "عملية مرفوضة: لا يمكن تعديل رتبة مالك النظام!" });

            if (request.NewRole == "Owner")
            {
                return BadRequest(new { message = "عملية غير صالحة: لا يمكن تعيين مالك جديد من خلال النظام. يوجد مالك واحد فقط." });
            }

            var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserRole == "Manager" && user.Email == currentUserEmail && request.NewRole != "Manager")
            {
                return BadRequest(new { message = "لا يمكنك تجريد نفسك من صلاحيات الإدارة. المالك فقط من يستطيع ذلك." });
            }

            user.Role = request.NewRole;
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم تعديل الرتبة بنجاح." });
        }

        [HttpPost("bulk-action")]
        public async Task<IActionResult> BulkAction([FromBody] BulkActionDto request)
        {
            if (request.UserIds == null || !request.UserIds.Any())
                return BadRequest(new { message = "لم يتم تحديد أي مستخدمين." });

            var users = await _context.Users.Where(u => request.UserIds.Contains(u.Id)).ToListAsync();

            if (users.Any(u => u.Role == "Owner"))
            {
                return BadRequest(new { message = "العملية الجماعية مرفوضة: تحتوي القائمة المحددة على مالك النظام." });
            }

            if (request.Action == "delete")
            {
                _context.Users.RemoveRange(users);
            }
            else if (request.Action == "freeze")
            {
                foreach (var u in users) u.IsActive = false;
            }
            else if (request.Action == "activate")
            {
                foreach (var u in users) u.IsActive = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "تم تنفيذ الإجراء الجماعي بنجاح." });
        }
    }

    public class BulkActionDto
    {
        public List<int> UserIds { get; set; }
        public string Action { get; set; }
    }

    public class ChangeRoleDto
    {
        public string NewRole { get; set; }
    }
}