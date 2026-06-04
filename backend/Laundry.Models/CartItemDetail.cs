namespace Laundry.Models;

public sealed class CartItemDetail
{
    public int CartItemId { get; set; }
    public int CustomerId { get; set; }
    public int ProviderId { get; set; }
    public int ItemId { get; set; }
    public int Quantity { get; set; }
    public DateTime? AddedAt { get; set; }
    public int ServiceTypeId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? ProviderName { get; set; }
}
