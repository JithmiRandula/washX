using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize(Roles = "provider")]
public sealed class NotificationsController : ControllerBase
{
    private readonly NotificationRepository _repo;
    private readonly UserRepository         _users;

    public NotificationsController(NotificationRepository repo, UserRepository users)
    {
        _repo  = repo;
        _users = users;
    }

    // GET /api/notifications  — list latest 50
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var pid = await GetProviderId();
        if (pid is null) return Unauthorized(new { success = false });

        var list = await _repo.GetByProvider(pid.Value);
        return Ok(new { success = true, data = list });
    }

    // GET /api/notifications/unread-count  — badge number
    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var pid = await GetProviderId();
        if (pid is null) return Unauthorized(new { success = false });

        var count = await _repo.GetUnreadCount(pid.Value);
        return Ok(new { success = true, count });
    }

    // PATCH /api/notifications/{id}/read  — mark one as read
    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var pid = await GetProviderId();
        if (pid is null) return Unauthorized(new { success = false });

        await _repo.MarkRead(id, pid.Value);
        return Ok(new { success = true });
    }

    // PATCH /api/notifications/read-all  — mark all as read
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var pid = await GetProviderId();
        if (pid is null) return Unauthorized(new { success = false });

        await _repo.MarkAllRead(pid.Value);
        return Ok(new { success = true });
    }

    // DELETE /api/notifications/{id}  — remove one
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var pid = await GetProviderId();
        if (pid is null) return Unauthorized(new { success = false });

        await _repo.Delete(id, pid.Value);
        return Ok(new { success = true });
    }

    // ── helper ───────────────────────────────────────────────────────────
    private async Task<int?> GetProviderId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId)) return null;
        return await _users.GetProviderIdByUserId(userId);
    }
}
