using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public sealed class AdminController(AdminRepository repo) : ControllerBase
{
    private readonly AdminRepository _repo = repo;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var stats = await _repo.GetDashboardStats();
            return Ok(new { success = true, data = stats });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var users = await _repo.GetAllUsers();
            return Ok(new { success = true, count = users.Count, data = users });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
    {
        try
        {
            var orders = await _repo.GetAllOrders();
            return Ok(new { success = true, count = orders.Count, data = orders });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("providers")]
    public async Task<IActionResult> GetProviders()
    {
        try
        {
            var providers = await _repo.GetAllProviders();
            return Ok(new { success = true, count = providers.Count, data = providers });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}
