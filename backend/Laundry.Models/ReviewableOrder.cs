namespace Laundry.Models;

public sealed class ReviewableOrder
{
    public int OrderId { get; set; }
    public string OrderReference { get; set; } = string.Empty;
    public DateTime? OrderDate { get; set; }
    public int ProviderId { get; set; }
    public string ProviderName { get; set; } = string.Empty;
}
