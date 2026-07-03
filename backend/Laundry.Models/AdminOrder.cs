namespace Laundry.Models;

public sealed class AdminOrder
{
    public int       OrderId        { get; set; }
    public string    OrderReference { get; set; } = string.Empty;
    public decimal   TotalAmount    { get; set; }
    public string    PaymentStatus  { get; set; } = string.Empty;
    public string    Status         { get; set; } = string.Empty;
    public DateTime? CreatedAt      { get; set; }
    public string    CustomerName   { get; set; } = string.Empty;
    public string    CustomerEmail  { get; set; } = string.Empty;
    public string?   CustomerPhone  { get; set; }
    public string?   ProviderName   { get; set; }
}
