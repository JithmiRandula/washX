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

    public bool OffersDelivery { get; set; }
    public decimal DeliveryFee { get; set; }

    public string? ImageUrl { get; set; }
    // Kept as a single-element list so the frontend's existing `images[0]` read keeps working.
    public List<string> Images => string.IsNullOrEmpty(ImageUrl) ? [] : [ImageUrl];

    public string? BusinessLicense { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    // Raw JSON: { monday: { open, close, isClosed }, ... } — parsed/serialized on the frontend.
    public string? OperatingHours { get; set; }

    public DateTime CreatedAt { get; set; }
}
