using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Laundry.API.Contracts.Auth;
using Laundry.BLL.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly Cloudinary _cloudinary;

    public UsersController(UserService userService, Cloudinary cloudinary)
    {
        _userService = userService;
        _cloudinary = cloudinary;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized(new { success = false, message = "Invalid token" });
        }

        if (!User.IsInRole("customer"))
        {
            return Forbid();
        }

        var profile = await _userService.GetCustomerProfile(userId.Value);
        if (profile is null)
        {
            return NotFound(new { success = false, message = "Customer profile not found" });
        }

        return Ok(new { success = true, data = profile });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized(new { success = false, message = "Invalid token" });
        }

        if (!User.IsInRole("customer"))
        {
            return Forbid();
        }

        AddressParts? address = request.Address is null
            ? null
            : new AddressParts
            {
                Street = request.Address.Street,
                City = request.Address.City,
                State = request.Address.State,
                ZipCode = request.Address.ZipCode
            };

        var profile = await _userService.UpdateCustomerProfile(
            userId.Value,
            request.Name,
            request.Phone,
            address);

        if (profile is null)
        {
            return NotFound(new { success = false, message = "Customer profile not found" });
        }

        return Ok(new { success = true, data = profile });
    }

    public sealed class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized(new { success = false, message = "Invalid token" });
        }

        try
        {
            await _userService.ChangePassword(userId.Value, request.CurrentPassword, request.NewPassword);
            return Ok(new { success = true, message = "Password changed successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // POST: /api/users/profile/photo — customer profile avatar
    [HttpPost("profile/photo")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(8 * 1024 * 1024)]
    public async Task<IActionResult> UploadProfilePhoto(IFormFile avatar)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized(new { success = false, message = "Invalid token" });
        }
        if (avatar is null || avatar.Length == 0)
        {
            return BadRequest(new { success = false, message = "Image file is required" });
        }

        await using var stream = avatar.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(avatar.FileName, stream),
            Folder = $"washx/avatars/{userId}",
            PublicId = "avatar",
            Overwrite = true,
            UseFilename = true,
            UniqueFilename = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.StatusCode != System.Net.HttpStatusCode.OK && result.StatusCode != System.Net.HttpStatusCode.Created)
        {
            return StatusCode(500, new { success = false, message = "Image upload failed" });
        }

        var profile = await _userService.UpdateAvatar(userId.Value, result.SecureUrl.ToString());
        if (profile is null)
        {
            return NotFound(new { success = false, message = "Customer profile not found" });
        }

        return Ok(new { success = true, data = profile });
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }
}
