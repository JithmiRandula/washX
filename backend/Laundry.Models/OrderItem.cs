namespace Laundry.Models;

public sealed class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int ProviderId { get; set; }
    public int? ServiceId { get; set; }
    public int? ItemId { get; set; }
    public string Kind { get; set; } = string.Empty; // 'item' or 'bulk'
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAt { get; set; }
}
