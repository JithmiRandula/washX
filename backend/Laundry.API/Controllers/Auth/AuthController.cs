using Laundry.API.Contracts.Auth;
using Laundry.API.DTOs.Auth;
using Laundry.BLL.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserService _service;

    public AuthController(UserService service)
    {
        _service = service;
    }

    // =========================
    // REGISTER
    // =========================
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserRequest req)
    {
        var user = new Laundry.Models.User
        {
            Email = req.Email,
            PasswordHash = req.Password,
            Name = req.Name ?? string.Empty,
            Phone = req.Phone ?? string.Empty,
            Role = req.Role ?? string.Empty
        };

        var result = await _service.Register(user, req.Address, req.Latitude, req.Longitude);

        if (!result)
            return BadRequest("Registration failed");

        return Ok("User registered successfully");
    }

    // =========================
    // LOGIN
    // =========================
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _service.Login(dto.Email, dto.Password);

        if (result == null)
            return Unauthorized("Invalid email or password");

        return Ok(result);
    }


    // =========================
    // CURRENT USER (session verify)
    // =========================
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var userId))
            return Unauthorized(new { success = false, message = "Invalid token" });

        var result = await _service.GetCurrentUserAsync(userId);
        if (result is null)
            return NotFound(new { success = false, message = "User not found" });

        return Ok(result);
    }

    // =========================
    // GOOGLE LOGIN START
    // =========================
    // The callback is handled entirely by the Google auth handler's OnTicketReceived
    // event (see Program.cs) — there is no matching controller action for it, since the
    // auth middleware always intercepts requests to CallbackPath before routing runs.
    [HttpGet("google")]
    public IActionResult GoogleLogin() => Challenge("Google");

    // =========================
    // SET / CHANGE PASSWORD (used right after first Google sign-in, or any time after)
    // =========================
    [Authorize]
    [HttpPut("updatepassword")]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest req)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var userId))
            return Unauthorized(new { success = false, message = "Invalid token" });

        try
        {
            await _service.UpdatePassword(userId, req.NewPassword);
            return Ok(new { success = true, message = "Password updated" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

public sealed class UpdatePasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}