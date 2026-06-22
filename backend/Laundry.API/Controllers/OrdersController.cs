using Laundry.BLL.Services.Commerce;
using Laundry.Models;
using Microsoft.AspNetCore.Mvc;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] Order order)
    {
        if (order is null) return BadRequest("Order payload is required");

        var id = await _orderService.CreateOrder(order);
        return CreatedAtAction(nameof(GetOrder), new { orderId = id }, new { orderId = id });
    }

    [HttpGet("{orderId:int}")]
    public async Task<IActionResult> GetOrder(int orderId)
    {
        var order = await _orderService.GetOrder(orderId);
        if (order is null) return NotFound();
        return Ok(order);
    }
}
