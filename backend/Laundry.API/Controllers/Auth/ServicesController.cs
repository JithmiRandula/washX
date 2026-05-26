using Laundry.API.Contracts.Services;
using Laundry.BLL.Services.Auth;
using Laundry.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laundry.API.Controllers.Auth
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly LaundryService _service;

        public ServicesController(LaundryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var services = await _service.GetAllServices();
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

            await _service.AddService(model);

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

            var affected = await _service.UpdateService(id, model);
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

            var affected = await _service.DeleteService(id);
            if (affected == 0)
            {
                return NotFound(new { message = "Service not found" });
            }

            return Ok(new { message = "Service Deleted Successfully" });
        }
    }
}