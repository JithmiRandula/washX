using Laundry.BLL.Services.Commerce;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ReviewsController : ControllerBase
{
    private readonly ReviewService _service;
    private readonly CartService   _cartService;

    public ReviewsController(ReviewService service, CartService cartService)
    {
        _service     = service;
        _cartService = cartService;
    }

    // ── Public endpoints ─────────────────────────────────────────────────────

    [HttpGet("provider/{providerId:int}")]
    public async Task<IActionResult> GetProviderReviews(int providerId)
    {
        try
        {
            var reviews = await _service.GetReviewsByProvider(providerId);
            return Ok(new { success = true, count = reviews.Count, data = reviews });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("provider/{providerId:int}/summary")]
    public async Task<IActionResult> GetRatingSummary(int providerId)
    {
        try
        {
            var summary = await _service.GetRatingSummary(providerId);
            return Ok(new { success = true, data = summary });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // ── Customer endpoints ───────────────────────────────────────────────────

    [Authorize(Roles = "customer")]
    [HttpGet("reviewable-orders")]
    public async Task<IActionResult> GetReviewableOrders()
    {
        try
        {
            var userId = GetUserId();
            if (userId is null) return Unauthorized();

            var customerId = await _cartService.ResolveCustomerIdAsync(userId.Value);
            var orders     = await _service.GetReviewableOrders(customerId);
            return Ok(new { success = true, count = orders.Count, data = orders });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [Authorize(Roles = "customer")]
    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewRequest req)
    {
        try
        {
            if (req is null)
                return BadRequest(new { success = false, message = "Request body is required." });

            var userId = GetUserId();
            if (userId is null) return Unauthorized();

            var customerId = await _cartService.ResolveCustomerIdAsync(userId.Value);

            var (ok, msg, reviewId) = await _service.AddReview(
                req.OrderId, customerId, req.ProviderId, req.Rating, req.Comment);

            if (!ok)
                return BadRequest(new { success = false, message = msg });

            return Ok(new { success = true, message = msg, reviewId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var id) ? id : null;
    }
}

public sealed class CreateReviewRequest
{
    public int    OrderId    { get; set; }
    public int    ProviderId { get; set; }
    public int    Rating     { get; set; }
    public string? Comment   { get; set; }
}
