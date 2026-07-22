namespace Laundry.Models;

// One row per distinct provider on an order — used to plot pickup/drop-off points on the map.
public sealed class OrderProviderLocation
{
    public int ProviderId { get; set; }
    public string ProviderName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}
