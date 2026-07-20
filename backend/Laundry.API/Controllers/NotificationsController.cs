using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize(Roles = "customer,provider")]
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
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        var list = identity.Value.Role == "provider"
            ? await _repo.GetByProvider(identity.Value.Id)
            : await _repo.GetByCustomer(identity.Value.Id);

        return Ok(new { success = true, data = list });
    }

    // GET /api/notifications/unread-count  — badge number
    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        var count = identity.Value.Role == "provider"
            ? await _repo.GetUnreadCountForProvider(identity.Value.Id)
            : await _repo.GetUnreadCountForCustomer(identity.Value.Id);

        return Ok(new { success = true, count });
    }

    // PATCH /api/notifications/{id}/read  — mark one as read
    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        await _repo.MarkRead(id, identity.Value.Role, identity.Value.Id);
        return Ok(new { success = true });
    }

    // PATCH /api/notifications/read-all  — mark all as read
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        await _repo.MarkAllRead(identity.Value.Role, identity.Value.Id);
        return Ok(new { success = true });
    }

    // DELETE /api/notifications/{id}  — remove one
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        await _repo.Delete(id, identity.Value.Role, identity.Value.Id);
        return Ok(new { success = true });
    }

    // ── helper ───────────────────────────────────────────────────────────
    private async Task<(string Role, int Id)?> ResolveIdentity()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId)) return null;

        var role = User.FindFirstValue(ClaimTypes.Role)?.ToLowerInvariant();

        if (role == "provider")
        {
            var pid = await _users.GetProviderIdByUserId(userId);
            return pid is int p ? ("provider", p) : null;
        }
        if (role == "customer")
        {
            var cid = await _users.GetCustomerIdByUserId(userId);
            return cid is int c ? ("customer", c) : null;
        }
        return null;
    }
}
