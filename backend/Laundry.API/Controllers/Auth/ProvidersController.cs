using Laundry.BLL.Services.Auth;
using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class ProvidersController : ControllerBase
{
    private readonly ProviderService _providerService;
    private readonly UserRepository  _users;

    public ProvidersController(ProviderService providerService, UserRepository users)
    {
        _providerService = providerService;
        _users = users;
    }

    // GET: /api/providers/{providerId}
    [Authorize]
    [HttpGet("{providerId:int}")]
    public async Task<IActionResult> GetProviderProfile([FromRoute] int providerId)
    {
        if (providerId <= 0)
        {
            return BadRequest(new { success = false, message = "Invalid provider id" });
        }

        var profile = await _providerService.GetProviderProfile(providerId);
        if (profile is null)
        {
            return NotFound(new { success = false, message = "Provider not found" });
        }

        return Ok(new { success = true, data = profile });
    }

    // GET: /api/providers/with-services
    [AllowAnonymous]
    [HttpGet("with-services")]
    public async Task<IActionResult> GetProvidersWithServices()
    {
        var providers = await _providerService.GetProvidersWithServices();
        return Ok(new { success = true, count = providers.Count, data = providers });
    }

    // GET: /api/providers/{providerId}/with-services
    [AllowAnonymous]
    [HttpGet("{providerId:int}/with-services")]
    public async Task<IActionResult> GetProviderWithServices([FromRoute] int providerId)
    {
        if (providerId <= 0)
        {
            return BadRequest(new { success = false, message = "Invalid provider id" });
        }

        var provider = await _providerService.GetProviderWithServices(providerId);
        if (provider is null)
        {
            return NotFound(new { success = false, message = "Provider not found" });
        }

        return Ok(new { success = true, data = provider });
    }

    public sealed class UpdateDeliverySettingsRequest
    {
        public bool OffersDelivery { get; set; }
        public decimal DeliveryFee { get; set; }
    }

    // PUT: /api/providers/{providerId}/delivery-settings
    [Authorize(Roles = "provider")]
    [HttpPut("{providerId:int}/delivery-settings")]
    public async Task<IActionResult> UpdateDeliverySettings(
        [FromRoute] int providerId, [FromBody] UpdateDeliverySettingsRequest req)
    {
        if (providerId <= 0)
        {
            return BadRequest(new { success = false, message = "Invalid provider id" });
        }
        if (req.DeliveryFee < 0)
        {
            return BadRequest(new { success = false, message = "Delivery fee cannot be negative" });
        }

        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId))
        {
            return Unauthorized(new { success = false });
        }

        var ownProviderId = await _users.GetProviderIdByUserId(userId);
        if (ownProviderId != providerId)
        {
            return Forbid();
        }

        await _providerService.UpdateDeliverySettings(providerId, req.OffersDelivery, req.DeliveryFee);
        return Ok(new { success = true });
    }
}
