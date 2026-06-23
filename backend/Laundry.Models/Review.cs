namespace Laundry.Models;

public sealed class Review
{
    public int ReviewId { get; set; }
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public int ProviderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime? CreatedAt { get; set; }

    // Populated by joins
    public string? CustomerName { get; set; }
    public string? OrderReference { get; set; }
}
