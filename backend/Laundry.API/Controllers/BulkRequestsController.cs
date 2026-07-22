using Laundry.BLL.Services.Commerce;
using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/bulkrequests")]
[Authorize(Roles = "customer,provider")]
public sealed class BulkRequestsController : ControllerBase
{
    private readonly BulkRequestService _service;
    private readonly UserRepository     _users;

    public BulkRequestsController(BulkRequestService service, UserRepository users)
    {
        _service = service;
        _users   = users;
    }

    public sealed class CreateBulkRequestBody
    {
        public int      ServiceId         { get; set; }
        public string   FulfillmentMethod { get; set; } = string.Empty; // "pickup" | "dropoff"
        public string?  Address           { get; set; }
        public DateTime? PreferredDate    { get; set; }
        public string?  PreferredSlot     { get; set; }
        public string?  Notes             { get; set; }
    }

    public sealed class WeighBody { public decimal ActualWeightKg { get; set; } }
    public sealed class MarkPaidBody { public string PaymentProvider { get; set; } = "PayHere"; }

    // POST /api/bulkrequests — customer submits a new bulk/weight-based request
    [Authorize(Roles = "customer")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBulkRequestBody body)
    {
        var customerId = await ResolveCustomerId();
        if (customerId is null) return Unauthorized(new { success = false });

        var (ok, error, id) = await _service.Create(
            customerId.Value, body.ServiceId, body.FulfillmentMethod, body.Address,
            body.PreferredDate, body.PreferredSlot, body.Notes);

        if (!ok) return BadRequest(new { success = false, message = error });
        return Ok(new { success = true, bulkRequestId = id });
    }

    // GET /api/bulkrequests/mine — customer's own requests
    [Authorize(Roles = "customer")]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var customerId = await ResolveCustomerId();
        if (customerId is null) return Unauthorized(new { success = false });

        var list = await _service.GetForCustomer(customerId.Value);
        return Ok(new { success = true, data = list });
    }

    // GET /api/bulkrequests/provider/mine — provider's incoming requests
    [Authorize(Roles = "provider")]
    [HttpGet("provider/mine")]
    public async Task<IActionResult> GetProviderMine()
    {
        var providerId = await ResolveProviderId();
        if (providerId is null) return Unauthorized(new { success = false });

        var list = await _service.GetForProvider(providerId.Value);
        return Ok(new { success = true, data = list });
    }

    // GET /api/bulkrequests/{id} — either the owning customer or the owning provider
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var req = await _service.GetById(id);
        if (req is null) return NotFound(new { success = false });

        var customerId = await ResolveCustomerId();
        var providerId = await ResolveProviderId();
        if (req.CustomerId != customerId && req.ProviderId != providerId)
            return Forbid();

        return Ok(new { success = true, data = req });
    }

    // ── Provider actions ─────────────────────────────────────────────────
    [Authorize(Roles = "provider")]
    [HttpPost("{id:int}/accept")]
    public async Task<IActionResult> Accept(int id) => await ProviderAction(id, pid => _service.Accept(id, pid));

    [Authorize(Roles = "provider")]
    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id) => await ProviderAction(id, pid => _service.Reject(id, pid));

    [Authorize(Roles = "provider")]
    [HttpPost("{id:int}/receive")]
    public async Task<IActionResult> Receive(int id) => await ProviderAction(id, pid => _service.MarkReceived(id, pid));

    [Authorize(Roles = "provider")]
    [HttpPost("{id:int}/weigh")]
    public async Task<IActionResult> Weigh(int id, [FromBody] WeighBody body)
    {
        var providerId = await ResolveProviderId();
        if (providerId is null) return Unauthorized(new { success = false });

        var (ok, error) = await _service.ConfirmWeight(id, providerId.Value, body.ActualWeightKg);
        if (!ok) return BadRequest(new { success = false, message = error ?? "Unable to confirm weight" });
        return Ok(new { success = true });
    }

    [Authorize(Roles = "provider")]
    [HttpPost("{id:int}/start-processing")]
    public async Task<IActionResult> StartProcessing(int id) => await ProviderAction(id, pid => _service.StartProcessing(id, pid));

    [Authorize(Roles = "provider")]
    [HttpPost("{id:int}/ready")]
    public async Task<IActionResult> Ready(int id) => await ProviderAction(id, pid => _service.MarkReady(id, pid));

    [Authorize(Roles = "provider")]
    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> Complete(int id) => await ProviderAction(id, pid => _service.Complete(id, pid));

    // ── Customer actions ─────────────────────────────────────────────────
    [Authorize(Roles = "customer")]
    [HttpPost("{id:int}/confirm")]
    public async Task<IActionResult> Confirm(int id) => await CustomerAction(id, cid => _service.CustomerConfirm(id, cid));

    [Authorize(Roles = "customer")]
    [HttpPost("{id:int}/mark-paid")]
    public async Task<IActionResult> MarkPaid(int id, [FromBody] MarkPaidBody body)
    {
        var customerId = await ResolveCustomerId();
        if (customerId is null) return Unauthorized(new { success = false });

        var ok = await _service.MarkPaid(id, customerId.Value, body.PaymentProvider);
        if (!ok) return BadRequest(new { success = false, message = "Unable to record payment" });
        return Ok(new { success = true });
    }

    [Authorize(Roles = "customer")]
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id) => await CustomerAction(id, cid => _service.CustomerCancel(id, cid));

    // ── helpers ──────────────────────────────────────────────────────────
    private async Task<IActionResult> ProviderAction(int id, Func<int, Task<bool>> action)
    {
        var providerId = await ResolveProviderId();
        if (providerId is null) return Unauthorized(new { success = false });

        var ok = await action(providerId.Value);
        if (!ok) return BadRequest(new { success = false, message = "Unable to update this bulk request" });
        return Ok(new { success = true });
    }

    private async Task<IActionResult> CustomerAction(int id, Func<int, Task<bool>> action)
    {
        var customerId = await ResolveCustomerId();
        if (customerId is null) return Unauthorized(new { success = false });

        var ok = await action(customerId.Value);
        if (!ok) return BadRequest(new { success = false, message = "Unable to update this bulk request" });
        return Ok(new { success = true });
    }

    private async Task<int?> ResolveCustomerId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId)) return null;
        if (User.FindFirstValue(ClaimTypes.Role)?.ToLowerInvariant() != "customer") return null;
        return await _users.GetCustomerIdByUserId(userId);
    }

    private async Task<int?> ResolveProviderId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId)) return null;
        if (User.FindFirstValue(ClaimTypes.Role)?.ToLowerInvariant() != "provider") return null;
        return await _users.GetProviderIdByUserId(userId);
    }
}
