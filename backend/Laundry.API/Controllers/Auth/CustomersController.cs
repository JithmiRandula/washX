using Laundry.DAL.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers.Auth
{
    [ApiController]
    [Route("api/customers")]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly UserRepository _repo;

        public CustomersController(UserRepository repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Returns the saved latitude/longitude for the currently logged-in customer.
        /// Used by the Providers page to sort nearby providers first.
        /// </summary>
        [HttpGet("location")]
        public async Task<IActionResult> GetMyLocation()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var userId))
                return Unauthorized(new { success = false, message = "Invalid token" });

            var profile = await _repo.GetCustomerProfileByUserId(userId);
            if (profile is null)
                return NotFound(new { success = false, message = "Customer profile not found" });

            return Ok(new
            {
                success = true,
                data = new
                {
                    latitude  = profile.Latitude,
                    longitude = profile.Longitude,
                    address   = profile.Address
                }
            });
        }
    }
}
