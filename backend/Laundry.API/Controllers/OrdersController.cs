using Laundry.BLL.Services.Commerce;
using Laundry.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "customer")]
public sealed class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    private readonly CartService _cartService;

    public OrdersController(OrderService orderService, CartService cartService)
    {
        _orderService = orderService;
        _cartService = cartService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] Order order)
    {
        try
        {
            if (order is null) return BadRequest("Order payload is required");

            var userId = GetUserId();
            if (userId is null) return Unauthorized(new { success = false, message = "Invalid token" });

            // Resolve customer id from authenticated user and attach to order
            var customerId = await _cartService.ResolveCustomerIdAsync(userId.Value);
            order.CustomerId = customerId;

            var id = await _orderService.CreateOrder(order);

            // Clear customer's cart after successful order creation
            await _cartService.ClearCartAsync(userId.Value);

            return CreatedAtAction(nameof(GetOrder), new { orderId = id }, new { orderId = id });
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
        return Ok(order);
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }
}
