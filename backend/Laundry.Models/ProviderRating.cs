namespace Laundry.Models;

public sealed class ProviderRating
{
    public int    ProviderId    { get; set; }
    public double AverageRating { get; set; }
    public int    TotalReviews  { get; set; }
}
