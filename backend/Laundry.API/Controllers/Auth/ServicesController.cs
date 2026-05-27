using Laundry.API.Contracts.Services;
using Laundry.BLL.Services.Auth;
using Laundry.DAL.Repositories;
using Laundry.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers.Auth
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly LaundryService _service;
        private readonly UserRepository _userRepository;

        public ServicesController(LaundryService service, UserRepository userRepository)
        {
            _service = service;
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var services = await _service.GetAllServices();
            return Ok(services);
        }

        [Authorize(Roles = "provider")]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var providerId = await ResolveProviderIdFromClaimsAsync();
            if (providerId is null)
            {
                return BadRequest(new { message = "Provider account not found for this user" });
            }

            var services = await _service.GetServicesByProviderId(providerId.Value);
            return Ok(services);
        }

        [Authorize(Roles = "provider")]
        [HttpPost]
        [HttpPost("add")]
        public async Task<IActionResult> AddService([FromBody] AddServiceRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.ServiceName) ||
                string.IsNullOrWhiteSpace(req.Category) ||
                string.IsNullOrWhiteSpace(req.PricingType))
            {
                return BadRequest("ServiceName, Category, and PricingType are required");
            }

            var model = new Service
            {
                ServiceName = req.ServiceName,
                Category = req.Category,
                PricingType = req.PricingType,
                Price = req.Price,
                MinimumOrder = req.MinimumOrder,
                TurnaroundTime = req.TurnaroundTime,
                Description = req.Description,
                KeyFeatures = req.KeyFeatures,
                SpecialInstructions = req.SpecialInstructions
            };

            var providerId = await ResolveProviderIdFromClaimsAsync();
            if (providerId is null)
            {
                return BadRequest(new { message = "Provider account not found for this user" });
            }

            await _service.AddService(providerId.Value, model);

            return Ok(new
            {
                message = "Service Added Successfully"
            });
        }

        [Authorize(Roles = "provider")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateService([FromRoute] int id, [FromBody] AddServiceRequest req)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid service id");
            }

            if (string.IsNullOrWhiteSpace(req.ServiceName) ||
                string.IsNullOrWhiteSpace(req.Category) ||
                string.IsNullOrWhiteSpace(req.PricingType))
            {
                return BadRequest("ServiceName, Category, and PricingType are required");
            }

            var model = new Service
            {
                ServiceId = id,
                ServiceName = req.ServiceName,
                Category = req.Category,
                PricingType = req.PricingType,
                Price = req.Price,
                MinimumOrder = req.MinimumOrder,
                TurnaroundTime = req.TurnaroundTime,
                Description = req.Description,
                KeyFeatures = req.KeyFeatures,
                SpecialInstructions = req.SpecialInstructions
            };

            var providerId = await ResolveProviderIdFromClaimsAsync();
            if (providerId is null)
            {
                return BadRequest(new { message = "Provider account not found for this user" });
            }

            var ownerProviderId = await _service.GetProviderIdForService(id);
            if (!ownerProviderId.HasValue)
            {
                return NotFound(new { message = "Service not found" });
            }

            if (ownerProviderId.Value != providerId.Value)
            {
                return NotFound(new { message = "Service not found" });
            }

            var affected = await _service.UpdateService(id, providerId.Value, model);
            if (affected == 0)
            {
                return NotFound(new { message = "Service not found" });
            }

            return Ok(new { message = "Service Updated Successfully" });
        }

        [Authorize(Roles = "provider")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteService([FromRoute] int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid service id");
            }

            var providerId = await ResolveProviderIdFromClaimsAsync();
            if (providerId is null)
            {
                return BadRequest(new { message = "Provider account not found for this user" });
            }

            var ownerProviderId = await _service.GetProviderIdForService(id);
            if (!ownerProviderId.HasValue)
            {
                return NotFound(new { message = "Service not found" });
            }

            if (ownerProviderId.Value != providerId.Value)
            {
                return NotFound(new { message = "Service not found" });
            }

            var affected = await _service.DeleteService(id);
            if (affected == 0)
            {
                return NotFound(new { message = "Service not found" });
            }

            return Ok(new { message = "Service Deleted Successfully" });
        }

        private async Task<int?> ResolveProviderIdFromClaimsAsync()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return null;
            }

            var providerId = await _userRepository.GetProviderIdByUserId(userId);
            return (providerId.HasValue && providerId.Value > 0) ? providerId.Value : null;
        }
    }
}