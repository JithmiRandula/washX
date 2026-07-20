using Laundry.BLL.Services.Chat;
using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize(Roles = "customer,provider")]
public sealed class ChatController : ControllerBase
{
    private readonly ChatService     _chat;
    private readonly UserRepository  _users;

    public ChatController(ChatService chat, UserRepository users)
    {
        _chat  = chat;
        _users = users;
    }

    public sealed class SendMessageRequest
    {
        public string Body { get; set; } = string.Empty;
    }

    public sealed class StartConversationRequest
    {
        public int? ProviderId { get; set; } // sent by a customer
        public int? CustomerId { get; set; } // sent by a provider
    }

    // GET /api/chat/conversations — list of threads for the logged-in user
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        var list = await _chat.GetConversations(identity.Value.Role, identity.Value.DomainId);
        return Ok(new { success = true, data = list });
    }

    // POST /api/chat/conversations/start — get-or-create a thread with the other party
    [HttpPost("conversations/start")]
    public async Task<IActionResult> StartConversation([FromBody] StartConversationRequest req)
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        int customerId, providerId;
        if (identity.Value.Role == "customer")
        {
            if (req.ProviderId is not int pid) return BadRequest(new { success = false, message = "providerId is required" });
            customerId = identity.Value.DomainId;
            providerId = pid;
        }
        else
        {
            if (req.CustomerId is not int cid) return BadRequest(new { success = false, message = "customerId is required" });
            providerId = identity.Value.DomainId;
            customerId = cid;
        }

        var conversationId = await _chat.StartConversation(customerId, providerId);
        return Ok(new { success = true, conversationId });
    }

    // GET /api/chat/conversations/{id}/messages
    [HttpGet("conversations/{id:int}/messages")]
    public async Task<IActionResult> GetMessages(int id)
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        var messages = await _chat.GetMessages(id, identity.Value.Role, identity.Value.DomainId);
        if (messages is null) return Forbid();
        return Ok(new { success = true, data = messages });
    }

    // POST /api/chat/conversations/{id}/messages
    [HttpPost("conversations/{id:int}/messages")]
    public async Task<IActionResult> SendMessage(int id, [FromBody] SendMessageRequest req)
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        var message = await _chat.SendMessage(id, identity.Value.Role, identity.Value.DomainId, identity.Value.UserId, req.Body);
        if (message is null) return BadRequest(new { success = false, message = "Unable to send message." });
        return Ok(new { success = true, data = message });
    }

    // PATCH /api/chat/conversations/{id}/read
    [HttpPatch("conversations/{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        var ok = await _chat.MarkRead(id, identity.Value.Role, identity.Value.DomainId);
        if (!ok) return Forbid();
        return Ok(new { success = true });
    }

    // GET /api/chat/unread-count — badge total across every conversation
    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var identity = await ResolveIdentity();
        if (identity is null) return Unauthorized(new { success = false });

        var count = await _chat.GetUnreadCount(identity.Value.Role, identity.Value.DomainId);
        return Ok(new { success = true, count });
    }

    // ── helper ───────────────────────────────────────────────────────────
    private async Task<(string Role, int DomainId, int UserId)?> ResolveIdentity()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId)) return null;

        var role = User.FindFirstValue(ClaimTypes.Role)?.ToLowerInvariant();

        if (role == "customer")
        {
            var cid = await _users.GetCustomerIdByUserId(userId);
            return cid is int c ? ("customer", c, userId) : null;
        }
        if (role == "provider")
        {
            var pid = await _users.GetProviderIdByUserId(userId);
            return pid is int p ? ("provider", p, userId) : null;
        }
        return null;
    }
}
