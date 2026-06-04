namespace Laundry.API.Contracts.Commerce;

public sealed class AddServiceItemRequest
{
    public int ServiceId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
}
