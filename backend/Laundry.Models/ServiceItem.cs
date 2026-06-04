namespace Laundry.Models;

public sealed class ServiceItem
{
    public int ItemId { get; set; }
    public int ServiceTypeId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime? CreatedAt { get; set; }
}
