namespace Laundry.Models;

public sealed class ServiceItem
{
    public int ItemId { get; set; }
    public int ServiceId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
}
