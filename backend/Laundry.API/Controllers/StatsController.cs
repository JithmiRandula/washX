using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/stats")]
[AllowAnonymous]
public sealed class StatsController : ControllerBase
{
    private readonly StatsRepository _repo;

    public StatsController(StatsRepository repo)
    {
        _repo = repo;
    }

    // GET /api/stats/public — real platform numbers for the marketing homepage, no auth required
    [HttpGet("public")]
    public async Task<IActionResult> GetPublicStats()
    {
        var stats = await _repo.GetPlatformStats();
        return Ok(new { success = true, data = stats });
    }
}
