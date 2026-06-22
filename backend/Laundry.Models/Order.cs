namespace Laundry.Models;

public sealed class Order
{
    public int OrderId { get; set; }
    public string OrderReference { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public string? PaymentProvider { get; set; }
    public string? PaymentStatus { get; set; }
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
    public List<OrderItem>? Items { get; set; }
}
