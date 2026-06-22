namespace Laundry.API.Contracts.Commerce;

public sealed class AddBulkItemRequest
{
    public int ServiceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int IncludedCount { get; set; } = 1;
    public decimal? MaxWeightKg { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
}
