using Laundry.API.Contracts.Payments;
using Laundry.BLL.Services.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly PayHereService _payHereService;
    private readonly PayHereSettings _settings;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(PayHereService payHereService, IConfiguration config, ILogger<PaymentsController> logger)
    {
        _payHereService = payHereService;
        _logger = logger;
        _settings = new PayHereSettings
        {
            MerchantId = config["PayHere:MerchantId"] ?? string.Empty,
            MerchantSecret = config["PayHere:MerchantSecret"] ?? string.Empty,
            AppId = config["PayHere:AppId"] ?? string.Empty,
            AppSecret = config["PayHere:AppSecret"] ?? string.Empty,
            Sandbox = !string.Equals(config["PayHere:Sandbox"], "false", StringComparison.OrdinalIgnoreCase),
            Currency = config["PayHere:Currency"] ?? "LKR",
            NotifyUrl = config["PayHere:NotifyUrl"] ?? string.Empty,
            ReturnUrl = config["PayHere:ReturnUrl"] ?? string.Empty,
            CancelUrl = config["PayHere:CancelUrl"] ?? string.Empty
        };
    }

    [Authorize]
    [HttpPost("payhere/checkout")]
    public IActionResult CreatePayHereCheckout([FromBody] PayHereCheckoutRequest request)
    {
        if (request.Amount <= 0)
        {
            return BadRequest(new { success = false, message = "Invalid payment amount" });
        }

        if (string.IsNullOrWhiteSpace(_settings.MerchantId) || string.IsNullOrWhiteSpace(_settings.MerchantSecret))
        {
            return StatusCode(500, new { success = false, message = "PayHere is not configured on the server" });
        }

        var userId = GetUserId();
        var orderId = PayHereService.CreateOrderId(userId);
        var amount = PayHereService.FormatAmount(request.Amount);
        var currency = _settings.Currency;

        var hash = _payHereService.GeneratePaymentHash(
            _settings.MerchantId,
            orderId,
            amount,
            currency,
            _settings.MerchantSecret);

        var items = string.IsNullOrWhiteSpace(request.Items)
            ? "WashX Laundry Order"
            : request.Items.Trim();

        if (items.Length > 250)
        {
            items = items[..250];
        }

        var checkoutUrl = _settings.Sandbox
            ? "https://sandbox.payhere.lk/pay/checkout"
            : "https://www.payhere.lk/pay/checkout";

        var returnUrl = string.IsNullOrWhiteSpace(_settings.ReturnUrl)
            ? "http://localhost:5173/payment/success"
            : _settings.ReturnUrl;

        var cancelUrl = string.IsNullOrWhiteSpace(_settings.CancelUrl)
            ? "http://localhost:5173/payment/cancel"
            : _settings.CancelUrl;

        // Hosted checkout (form POST) — works on localhost without CORS.
        var payment = new
        {
            sandbox = _settings.Sandbox,
            checkout_url = checkoutUrl,
            merchant_id = _settings.MerchantId,
            return_url = returnUrl,
            cancel_url = cancelUrl,
            notify_url = _settings.NotifyUrl,
            order_id = orderId,
            items,
            amount,
            currency,
            hash,
            first_name = string.IsNullOrWhiteSpace(request.FirstName) ? "Customer" : request.FirstName.Trim(),
            last_name = string.IsNullOrWhiteSpace(request.LastName) ? "WashX" : request.LastName.Trim(),
            email = string.IsNullOrWhiteSpace(request.Email) ? "customer@washx.local" : request.Email.Trim(),
            phone = string.IsNullOrWhiteSpace(request.Phone) ? "0770000000" : request.Phone.Trim(),
            address = string.IsNullOrWhiteSpace(request.Address) ? "Colombo" : request.Address.Trim(),
            city = string.IsNullOrWhiteSpace(request.City) ? "Colombo" : request.City.Trim(),
            country = "Sri Lanka"
        };

        return Ok(new { success = true, data = payment });
    }

    [AllowAnonymous]
    [HttpPost("payhere/notify")]
    public IActionResult PayHereNotify()
    {
        var form = Request.Form;

        var merchantId = form["merchant_id"].ToString();
        var orderId = form["order_id"].ToString();
        var payhereAmount = form["payhere_amount"].ToString();
        var payhereCurrency = form["payhere_currency"].ToString();
        var statusCode = form["status_code"].ToString();
        var md5sig = form["md5sig"].ToString();
        var statusMessage = form["status_message"].ToString();

        if (string.IsNullOrWhiteSpace(_settings.MerchantSecret))
        {
            _logger.LogWarning("PayHere notify received but MerchantSecret is not configured");
            return BadRequest();
        }

        var valid = _payHereService.VerifyNotificationSignature(
            merchantId,
            orderId,
            payhereAmount,
            payhereCurrency,
            statusCode,
            md5sig,
            _settings.MerchantSecret);

        if (!valid)
        {
            _logger.LogWarning("PayHere notify signature invalid for order {OrderId}", orderId);
            return BadRequest();
        }

        _logger.LogInformation(
            "PayHere payment notify: order={OrderId} status={StatusCode} message={Message} amount={Amount}",
            orderId,
            statusCode,
            statusMessage,
            payhereAmount);

        // status_code 2 = success per PayHere docs
        return Ok();
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }
}
