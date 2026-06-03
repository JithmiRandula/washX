using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace Laundry.BLL.Services.Payments;

public sealed class PayHereSettings
{
    public string MerchantId { get; set; } = string.Empty;
    public string MerchantSecret { get; set; } = string.Empty;
    public string AppId { get; set; } = string.Empty;
    public string AppSecret { get; set; } = string.Empty;
    public bool Sandbox { get; set; } = true;
    public string Currency { get; set; } = "LKR";
    public string NotifyUrl { get; set; } = string.Empty;
    public string ReturnUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
}

public sealed class PayHereService
{
    public string GeneratePaymentHash(string merchantId, string orderId, string amount, string currency, string merchantSecret)
    {
        var secretHash = ComputeMd5Hex(merchantSecret).ToUpperInvariant();
        var raw = merchantId + orderId + amount + currency + secretHash;
        return ComputeMd5Hex(raw).ToUpperInvariant();
    }

    public bool VerifyNotificationSignature(
        string merchantId,
        string orderId,
        string payhereAmount,
        string payhereCurrency,
        string statusCode,
        string md5sig,
        string merchantSecret)
    {
        if (string.IsNullOrWhiteSpace(md5sig))
            return false;

        var secretHash = ComputeMd5Hex(merchantSecret).ToUpperInvariant();
        var raw = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + secretHash;
        var local = ComputeMd5Hex(raw).ToUpperInvariant();
        return string.Equals(local, md5sig, StringComparison.OrdinalIgnoreCase);
    }

    public static string FormatAmount(decimal amount)
    {
        return amount.ToString("0.00", CultureInfo.InvariantCulture);
    }

    public static string CreateOrderId(int? userId)
    {
        var suffix = userId.HasValue ? userId.Value.ToString() : "guest";
        return $"WASHX-{suffix}-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
    }

    private static string ComputeMd5Hex(string input)
    {
        var bytes = MD5.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
