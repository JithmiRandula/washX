using Laundry.BLL.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laundry.API.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class ProvidersController : ControllerBase
{
    private readonly ProviderService _providerService;

    public ProvidersController(ProviderService providerService)
    {
        _providerService = providerService;
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
}
