namespace Laundry.Models;

public sealed class ProviderProfile
{
    public int ProviderId { get; set; }
    public int UserId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    public string BusinessName { get; set; } = string.Empty;
    public string? BusinessAddress { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public string? Description { get; set; }
    public decimal Rating { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}
