using Laundry.API.Contracts.Commerce;
using Laundry.BLL.Services.Commerce;
using Laundry.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BulkItemsController : ControllerBase
{
    private readonly BulkItemService _service;

    public BulkItemsController(BulkItemService service)
    {
        _service = service;
    }

    [Authorize(Roles = "provider")]
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddBulkItemRequest request)
    {
        try
        {
            await _service.AddBulkItem(new BulkItem
            {
                ServiceId = request.ServiceId,
                Name = request.Name,
                IncludedCount = request.IncludedCount,
                MaxWeightKg = request.MaxWeightKg,
                Price = request.Price,
                ImageUrl = request.ImageUrl,
                Description = request.Description
            });

            return Ok(new { success = true, message = "Bulk item added successfully" });
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
            var items = await _service.GetBulkItems(serviceId);
            return Ok(new { success = true, count = items.Count, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "provider")]
    [HttpGet("manage/by-service/{serviceId:int}")]
    public async Task<IActionResult> GetForManage(int serviceId)
    {
        try
        {
            var items = await _service.GetProviderBulkItems(serviceId);
            return Ok(new { success = true, count = items.Count, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "provider")]
    [HttpPut("{bulkItemId:int}")]
    public async Task<IActionResult> Update(int bulkItemId, [FromBody] UpdateBulkItemRequest request)
    {
        try
        {
            await _service.UpdateBulkItem(bulkItemId, new BulkItem
            {
                ServiceId = request.ServiceId,
                Name = request.Name,
                IncludedCount = request.IncludedCount,
                MaxWeightKg = request.MaxWeightKg,
                Price = request.Price,
                ImageUrl = request.ImageUrl,
                Description = request.Description
            });

            return Ok(new { success = true, message = "Bulk item updated successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "provider")]
    [HttpDelete("{bulkItemId:int}")]
    public async Task<IActionResult> Delete(int bulkItemId)
    {
        try
        {
            await _service.DeleteBulkItem(bulkItemId);
            return Ok(new { success = true, message = "Bulk item hidden from customers (soft delete)." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "provider")]
    [HttpPost("{bulkItemId:int}/restore")]
    public async Task<IActionResult> Restore(int bulkItemId)
    {
        try
        {
            await _service.RestoreBulkItem(bulkItemId);
            return Ok(new { success = true, message = "Bulk item restored and visible to customers again" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
