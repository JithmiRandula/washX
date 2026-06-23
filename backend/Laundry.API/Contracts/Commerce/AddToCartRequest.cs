namespace Laundry.API.Contracts.Commerce;

public sealed class AddToCartRequest
{
    public int ProviderId { get; set; }
    // For item-based cart rows
    public int? ItemId { get; set; }
    // For bulk packages
    public int? BulkItemId { get; set; }
    public string? Kind { get; set; } = "item"; // 'item' or 'bulk'
    public int Quantity { get; set; } = 1;
    public int? Bags { get; set; }
    public decimal? MaxKg { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? Price { get; set; }
    public string? Description { get; set; }
}
