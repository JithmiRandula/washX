using Laundry.BLL.Services.Commerce;
using Laundry.DAL.Repositories;
using Laundry.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class OrdersController : ControllerBase
{
    private readonly OrderService            _orderService;
    private readonly CartService             _cartService;
    private readonly NotificationRepository  _notifications;

    public OrdersController(
        OrderService           orderService,
        CartService            cartService,
        NotificationRepository notifications)
    {
        _orderService   = orderService;
        _cartService    = cartService;
        _notifications  = notifications;
    }

    [Authorize(Roles = "customer")]
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] Order order)
    {
        try
        {
            if (order is null) return BadRequest(new { success = false, message = "Order payload is required" });

            var userId = GetUserId();
            if (userId is null) return Unauthorized(new { success = false, message = "Invalid token" });

            var customerId = await _cartService.ResolveCustomerIdAsync(userId.Value);
            order.CustomerId = customerId;

            var id = await _orderService.CreateOrder(order);

            // Fire a notification for each distinct provider in this order (non-fatal)
            try
            {
                var providerIds = (order.Items ?? [])
                    .Select(i => i.ProviderId)
                    .Where(pid => pid > 0)
                    .Distinct();

                foreach (var pid in providerIds)
                    await _notifications.AddOrderNotification(
                        pid, id,
                        order.OrderReference ?? string.Empty,
                        customerName: null,
                        order.TotalAmount);
            }
            catch { /* notification failure must never break order creation */ }

            // Clear cart non-fatally — order is already saved
            try { await _cartService.ClearCartAsync(userId.Value); } catch { /* ignore */ }

            return Ok(new { success = true, orderId = id });
        }
        catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601)
        {
            // Unique constraint violation — duplicate OrderReference (StrictMode double-submit)
            return Ok(new { success = true, duplicate = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "customer")]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyOrders()
    {
        try
        {
            var userId = GetUserId();
            if (userId is null) return Unauthorized(new { success = false });

            var customerId = await _cartService.ResolveCustomerIdAsync(userId.Value);
            var orders = await _orderService.GetOrdersByCustomer(customerId);
            return Ok(new { success = true, count = orders.Count, data = orders });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("{orderId:int}")]
    public async Task<IActionResult> GetOrder(int orderId)
    {
        var order = await _orderService.GetOrder(orderId);
        if (order is null) return NotFound();
        return Ok(new { success = true, data = order });
    }

    // Provider endpoints: list orders for provider and update order item status
    [Authorize(Roles = "provider")]
    [HttpGet("provider/mine")]
    public async Task<IActionResult> GetProviderOrders()
    {
        try
        {
            var providerId = await ResolveProviderIdFromClaimsAsync();
            if (!providerId.HasValue) return BadRequest(new { success = false, message = "Provider account not found" });

            var orders = await _orderService.GetOrdersByProvider(providerId.Value);
            return Ok(new { success = true, count = orders.Count, data = orders });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "provider")]
    [HttpPatch("items/{orderItemId:int}/status")]
    public async Task<IActionResult> UpdateOrderItemStatus(int orderItemId, [FromBody] UpdateStatusRequest req)
    {
        if (string.IsNullOrWhiteSpace(req?.Status)) return BadRequest(new { message = "Status is required" });

        var providerId = await ResolveProviderIdFromClaimsAsync();
        if (!providerId.HasValue) return BadRequest(new { message = "Provider account not found" });

        var affected = await _orderService.UpdateOrderItemStatus(orderItemId, req.Status, providerId.Value);
        if (!affected) return NotFound(new { message = "Order item not found or not owned by provider" });

        return Ok(new { message = "Status updated" });
    }

    [Authorize(Roles = "provider")]
    [HttpPatch("{orderId:int}/provider-status")]
    public async Task<IActionResult> UpdateProviderOrderStatus(int orderId, [FromBody] UpdateStatusRequest req)
    {
        if (string.IsNullOrWhiteSpace(req?.Status))
            return BadRequest(new { success = false, message = "Status is required" });

        var providerId = await ResolveProviderIdFromClaimsAsync();
        if (!providerId.HasValue) return BadRequest(new { success = false, message = "Provider account not found" });

        var ok = await _orderService.UpdateOrderStatusByProvider(orderId, providerId.Value, req.Status);
        if (!ok) return NotFound(new { success = false, message = "No matching order items found" });

        return Ok(new { success = true, message = $"Order status updated to {req.Status}" });
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }

    private async Task<int?> ResolveProviderIdFromClaimsAsync()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var userId)) return null;

        // use repository to map user->provider
        var userRepo = HttpContext.RequestServices.GetService(typeof(Laundry.DAL.Repositories.UserRepository)) as Laundry.DAL.Repositories.UserRepository;
        if (userRepo is null) return null;

        var prov = await userRepo.GetProviderIdByUserId(userId);
        return prov.HasValue ? prov.Value : null;
    }
}

public sealed class UpdateStatusRequest { public string? Status { get; set; } }
