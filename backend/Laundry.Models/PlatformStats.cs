namespace Laundry.Models;

public sealed class PlatformStats
{
    public int    TotalProviders { get; set; }
    public int    TotalCustomers { get; set; }
    public double AverageRating  { get; set; }
    public int    TotalReviews   { get; set; }
}
