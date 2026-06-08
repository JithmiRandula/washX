namespace Laundry.API.Contracts.Commerce;

public sealed class UploadServiceItemImageRequest
{
    public int ServiceId { get; set; }
    public IFormFile File { get; set; } = null!;
}
