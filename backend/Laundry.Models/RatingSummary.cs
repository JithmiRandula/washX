namespace Laundry.Models;

public sealed class RatingSummary
{
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public int Star5 { get; set; }
    public int Star4 { get; set; }
    public int Star3 { get; set; }
    public int Star2 { get; set; }
    public int Star1 { get; set; }
}
