using Laundry.API.Contracts.Commerce;
using Laundry.BLL.Services.Commerce;
using Laundry.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceItemsController : ControllerBase
{
    private readonly ServiceItemService _service;

    public ServiceItemsController(ServiceItemService service)
    {
        _service = service;
    }

    /// <summary>Step 1 — Provider adds an item to a service type (uses SP_AddServiceItem).</summary>
    [Authorize(Roles = "provider")]
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddServiceItemRequest request)
    {
        try
        {
            await _service.AddServiceItem(new ServiceItem
            {
                ServiceTypeId = request.ServiceTypeId,
                ItemName = request.ItemName,
                Description = request.Description,
                Price = request.Price,
                ImageUrl = request.ImageUrl
            });

            return Ok(new { success = true, message = "Service item added successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("by-service-type/{serviceTypeId:int}")]
    public async Task<IActionResult> GetByServiceType(int serviceTypeId)
    {
        try
        {
            var items = await _service.GetServiceItems(serviceTypeId);
            return Ok(new { success = true, count = items.Count, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "provider")]
    [HttpPut("{itemId:int}")]
    public async Task<IActionResult> Update(int itemId, [FromBody] UpdateServiceItemRequest request)
    {
        try
        {
            await _service.UpdateServiceItem(itemId, new ServiceItem
            {
                ServiceTypeId = request.ServiceTypeId,
                ItemName = request.ItemName,
                Description = request.Description,
                Price = request.Price,
                ImageUrl = request.ImageUrl
            });

            return Ok(new { success = true, message = "Service item updated successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "provider")]
    [HttpDelete("{itemId:int}")]
    public async Task<IActionResult> Delete(int itemId, [FromQuery] int serviceTypeId)
    {
        try
        {
            await _service.DeleteServiceItem(itemId, serviceTypeId);
            return Ok(new { success = true, message = "Service item deleted successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
