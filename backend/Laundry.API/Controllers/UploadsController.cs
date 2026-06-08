using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Laundry.API.Contracts.Commerce;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Security.Claims;

namespace Laundry.API.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "provider")]
public class UploadsController : ControllerBase
{
    private readonly Cloudinary _cloudinary;

    public UploadsController(Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
    }

    [HttpPost("service-item-image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(8 * 1024 * 1024)]
    public async Task<IActionResult> UploadServiceItemImage([FromForm] UploadServiceItemImageRequest request)
    {
        if (request.ServiceId <= 0)
            return BadRequest(new { success = false, message = "Invalid serviceId" });

        if (request.File is null || request.File.Length == 0)
            return BadRequest(new { success = false, message = "Image file is required" });

        var providerUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "provider";
        var publicId = Path.GetFileNameWithoutExtension(request.File.FileName);

        await using var stream = request.File.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(request.File.FileName, stream),
            Folder = $"washx/service-items/{providerUserId}/{request.ServiceId}",
            PublicId = publicId,
            Overwrite = true,
            UseFilename = true,
            UniqueFilename = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.StatusCode != System.Net.HttpStatusCode.OK && result.StatusCode != System.Net.HttpStatusCode.Created)
            return StatusCode(500, new { success = false, message = "Cloudinary upload failed" });

        return Ok(new { success = true, url = result.SecureUrl.ToString() });
    }
}

