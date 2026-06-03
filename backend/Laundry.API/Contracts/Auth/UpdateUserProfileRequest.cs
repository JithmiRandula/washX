namespace Laundry.API.Contracts.Auth;

public sealed class UpdateUserProfileRequest
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public AddressDto? Address { get; set; }
}

public sealed class AddressDto
{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
}
