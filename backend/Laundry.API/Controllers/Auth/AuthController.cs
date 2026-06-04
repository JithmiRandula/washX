using Laundry.API.Contracts.Auth;
using Laundry.API.DTOs.Auth;
using Laundry.BLL.Services.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserService _service;
    private readonly TokenService _tokenService;

    public AuthController(UserService service, TokenService tokenService)
    {
        _service = service;
        _tokenService = tokenService;
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
    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var redirectUrl = Url.Action("GoogleResponse", "Auth");
        var properties = new AuthenticationProperties
        {
            RedirectUri = redirectUrl
        };

        return Challenge(properties, "Google");
    }

    // =========================
    // GOOGLE CALLBACK (ADD HERE)
    // =========================
    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleResponse()
    {
        var result = await HttpContext.AuthenticateAsync("Cookies");

        if (!result.Succeeded)
            return BadRequest("Google login failed");

        var claims = result.Principal.Identities.First().Claims;

        var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

        // 🔥 call BLL
        var user = await _service.HandleGoogleLogin(name, email);

        // 🔥 create JWT
        var token = _tokenService.CreateToken(user);

        // 🔥 redirect to frontend
        return Redirect($"http://localhost:5173/google-success?token={token}&role={user.Role}&userId={user.UserId}");
    }
}