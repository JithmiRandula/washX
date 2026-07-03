namespace Laundry.Models;

public sealed class AdminProvider
{
    public int       ProviderId       { get; set; }
    public string    BusinessName     { get; set; } = string.Empty;
    public string?   BusinessAddress  { get; set; }
    public bool      IsVerified       { get; set; }
    public DateTime? JoinedAt         { get; set; }
    public string    OwnerName        { get; set; } = string.Empty;
    public string    Email            { get; set; } = string.Empty;
    public string?   Phone            { get; set; }
    public int       TotalOrders      { get; set; }
    public double    AverageRating    { get; set; }
    public int       TotalReviews     { get; set; }
    public decimal   Revenue          { get; set; }
}
