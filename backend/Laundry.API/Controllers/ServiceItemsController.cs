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

    [Authorize(Roles = "provider")]
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddServiceItemRequest request)
    {
        try
        {
            await _service.AddServiceItem(new ServiceItem
            {
                ServiceId = request.ServiceId,
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
    [HttpGet("by-service/{serviceId:int}")]
    public async Task<IActionResult> GetByService(int serviceId)
    {
        try
        {
            var items = await _service.GetServiceItems(serviceId);
            return Ok(new { success = true, count = items.Count, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>Provider manage page — includes soft-deleted items (IsAvailable = 0).</summary>
    [Authorize(Roles = "provider")]
    [HttpGet("manage/by-service/{serviceId:int}")]
    public async Task<IActionResult> GetForManage(int serviceId)
    {
        try
        {
            var items = await _service.GetProviderServiceItems(serviceId);
            return Ok(new { success = true, count = items.Count, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>Legacy route alias — same as by-service/{id}.</summary>
    [AllowAnonymous]
    [HttpGet("by-service-type/{serviceId:int}")]
    public Task<IActionResult> GetByServiceType(int serviceId) => GetByService(serviceId);

    [Authorize(Roles = "provider")]
    [HttpPut("{itemId:int}")]
    public async Task<IActionResult> Update(int itemId, [FromBody] UpdateServiceItemRequest request)
    {
        try
        {
            await _service.UpdateServiceItem(itemId, new ServiceItem
            {
                ServiceId = request.ServiceId,
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
    public async Task<IActionResult> Delete(int itemId, [FromQuery] int serviceId)
    {
        try
        {
            await _service.DeleteServiceItem(itemId, serviceId);
            return Ok(new { success = true, message = "Item hidden from customers (soft delete). Row kept in database." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "provider")]
    [HttpPost("{itemId:int}/restore")]
    public async Task<IActionResult> Restore(int itemId, [FromQuery] int serviceId)
    {
        try
        {
            await _service.RestoreServiceItem(itemId, serviceId);
            return Ok(new { success = true, message = "Item restored and visible to customers again" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
