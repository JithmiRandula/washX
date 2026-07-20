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
    public List<OrderProviderDelivery>? Deliveries { get; set; }

    // Populated by aggregate queries (null on simple GetById)
    public int? ItemCount { get; set; }
    public string? ProviderNames { get; set; }
    public string? OverallStatus { get; set; }

    // Populated on provider list view only
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    public string? ProviderStatus { get; set; }
}
