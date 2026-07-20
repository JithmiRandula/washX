namespace Laundry.Models;

public sealed class OrderProviderDelivery
{
    public int       OrderId        { get; set; }
    public int       ProviderId     { get; set; }
    public string    DeliveryOption { get; set; } = "self"; // "self" | "provider"
    public decimal   DeliveryFee    { get; set; }
    public string?   DeliveryStatus { get; set; }            // null | pending | picked_up | on_the_way | delivered
    public DateTime? UpdatedAt      { get; set; }
    public string?   ProviderName   { get; set; }
}
