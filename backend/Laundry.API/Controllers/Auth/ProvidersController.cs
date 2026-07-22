using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Laundry.BLL.Services.Auth;
using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace Laundry.API.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class ProvidersController : ControllerBase
{
    private readonly ProviderService _providerService;
    private readonly UserRepository  _users;
    private readonly Cloudinary      _cloudinary;

    public ProvidersController(ProviderService providerService, UserRepository users, Cloudinary cloudinary)
    {
        _providerService = providerService;
        _users = users;
        _cloudinary = cloudinary;
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

    // POST: /api/providers/{providerId}/upload — business/logo image, shown to customers
    [Authorize(Roles = "provider")]
    [HttpPost("{providerId:int}/upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(8 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage([FromRoute] int providerId, IFormFile image)
    {
        if (providerId <= 0)
        {
            return BadRequest(new { success = false, message = "Invalid provider id" });
        }
        if (image is null || image.Length == 0)
        {
            return BadRequest(new { success = false, message = "Image file is required" });
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

        await using var stream = image.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(image.FileName, stream),
            Folder = $"washx/providers/{providerId}",
            PublicId = "profile",
            Overwrite = true,
            UseFilename = true,
            UniqueFilename = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.StatusCode != System.Net.HttpStatusCode.OK && result.StatusCode != System.Net.HttpStatusCode.Created)
        {
            return StatusCode(500, new { success = false, message = "Image upload failed" });
        }

        var url = result.SecureUrl.ToString();
        await _providerService.UpdateImageUrl(providerId, url);
        return Ok(new { success = true, data = url });
    }

    public sealed class UpdateProviderProfileRequest
    {
        public string BusinessName { get; set; } = string.Empty;
        public string? OwnerName { get; set; }
        public string? Description { get; set; }
        public string? BusinessLicense { get; set; }
        public string? Phone { get; set; }
        public AddressDto? Address { get; set; }
        public Dictionary<string, DayHoursDto>? OperatingHours { get; set; }

        public sealed class AddressDto
        {
            public string? Street { get; set; }
            public string? City { get; set; }
            public string? State { get; set; }
            public string? ZipCode { get; set; }
            public CoordinatesDto? Coordinates { get; set; }
        }

        public sealed class CoordinatesDto
        {
            public decimal? Lat { get; set; }
            public decimal? Lng { get; set; }
        }

        public sealed class DayHoursDto
        {
            public string? Open { get; set; }
            public string? Close { get; set; }
            public bool IsClosed { get; set; }
        }
    }

    // PUT: /api/providers/{providerId}/profile
    [Authorize(Roles = "provider")]
    [HttpPut("{providerId:int}/profile")]
    public async Task<IActionResult> UpdateProfile([FromRoute] int providerId, [FromBody] UpdateProviderProfileRequest req)
    {
        if (providerId <= 0)
        {
            return BadRequest(new { success = false, message = "Invalid provider id" });
        }
        if (string.IsNullOrWhiteSpace(req.BusinessName))
        {
            return BadRequest(new { success = false, message = "Business name is required" });
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

        var hoursJson = req.OperatingHours is { Count: > 0 } ? JsonSerializer.Serialize(req.OperatingHours) : null;

        await _providerService.UpdateProfile(
            providerId,
            req.BusinessName.Trim(),
            req.Description?.Trim(),
            req.BusinessLicense?.Trim(),
            req.Address?.Street?.Trim(),
            req.Address?.City?.Trim(),
            req.Address?.State?.Trim(),
            req.Address?.ZipCode?.Trim(),
            req.Address?.Coordinates?.Lat,
            req.Address?.Coordinates?.Lng,
            hoursJson);

        if (!string.IsNullOrWhiteSpace(req.OwnerName) && !string.IsNullOrWhiteSpace(req.Phone))
        {
            await _users.UpdateUserProfile(userId, req.OwnerName.Trim(), req.Phone.Trim());
        }

        return Ok(new { success = true });
    }
}
