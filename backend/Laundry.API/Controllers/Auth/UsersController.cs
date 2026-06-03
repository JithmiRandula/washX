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

    public UsersController(UserService userService)
    {
        _userService = userService;
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

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }
}
