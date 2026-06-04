using Laundry.API.Contracts.Commerce;
using Laundry.BLL.Services.Commerce;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "customer")]
public class CartController : ControllerBase
{
    private readonly CartService _cartService;

    public CartController(CartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        try
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var items = await _cartService.GetCartItemsAsync(userId.Value);
            return Ok(new { success = true, count = items.Count, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number is 208 or 207)
        {
            return Ok(new { success = true, count = 0, data = Array.Empty<object>(), message = "Cart not configured in database yet" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            await _cartService.AddToCartAsync(
                userId.Value,
                request.ProviderId,
                request.ItemId,
                request.Quantity);

            var items = await _cartService.GetCartItemsAsync(userId.Value);
            return Ok(new { success = true, message = "Item added to cart", count = items.Count, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("{cartItemId:int}/increase")]
    public async Task<IActionResult> Increase(int cartItemId)
    {
        try
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            await _cartService.IncreaseQuantityAsync(userId.Value, cartItemId);
            var items = await _cartService.GetCartItemsAsync(userId.Value);
            return Ok(new { success = true, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("{cartItemId:int}/decrease")]
    public async Task<IActionResult> Decrease(int cartItemId)
    {
        try
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            await _cartService.DecreaseQuantityAsync(userId.Value, cartItemId);
            var items = await _cartService.GetCartItemsAsync(userId.Value);
            return Ok(new { success = true, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("{cartItemId:int}")]
    public async Task<IActionResult> Remove(int cartItemId)
    {
        try
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            await _cartService.RemoveItemAsync(userId.Value, cartItemId);
            var items = await _cartService.GetCartItemsAsync(userId.Value);
            return Ok(new { success = true, data = items });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> Clear()
    {
        try
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized(new { success = false, message = "Invalid token" });

            await _cartService.ClearCartAsync(userId.Value);
            return Ok(new { success = true, message = "Cart cleared", data = Array.Empty<object>() });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }
}
