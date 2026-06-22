namespace Laundry.Models;

public sealed class BulkItem
{
    public int BulkItemId { get; set; }
    public int ServiceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int IncludedCount { get; set; }
    public decimal? MaxWeightKg { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public bool IsAvailable { get; set; } = true;
}
