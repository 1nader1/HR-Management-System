using HRSYS.Models;
using HRSYS.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRSYS.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeRepository _repository;

        public EmployeesController(IEmployeeRepository repository)
        {
            _repository = repository;
        }


        [Authorize(Roles = "Manager,User,Owner")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            var employees = await _repository.GetAllAsync();
            return Ok(employees);
        }

        [Authorize(Roles = "Manager,User,Owner")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _repository.GetByIdAsync(id);
            if (employee == null) return NotFound("employee not found");

            return Ok(employee);
        }

        [Authorize(Roles = "Manager,Owner")]
        [HttpPost]
        public async Task<ActionResult<Employee>> AddEmployee(Employee employee)
        {
            if (await _repository.EmailExistsAsync(employee.Email))
            {
                return BadRequest("هذا البريد الإلكتروني مسجل مسبقاً.");
            }

            var createdEmployee = await _repository.AddAsync(employee);
            return Ok(createdEmployee);
        }

        [Authorize(Roles = "Manager,Owner")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
        {
            if (id != employee.Id) return BadRequest("ID doesn't match");

            if (await _repository.EmailExistsAsync(employee.Email, id))
            {
                return BadRequest("هذا البريد الإلكتروني مسجل مسبقاً لموظف آخر.");
            }

            var success = await _repository.UpdateAsync(employee);
            if (!success) return BadRequest("حدث خطأ أثناء التحديث.");

            return Ok();
        }

        [Authorize(Roles = "Manager,Owner")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var success = await _repository.DeleteAsync(id);
            if (!success) return NotFound("employee not found");

            return Ok();
        }
    }
}