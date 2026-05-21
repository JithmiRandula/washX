namespace Laundry.API.Contracts.Auth;

public sealed record RegisterUserRequest(
    string Email,
    string Password,
    string? Name,
    string? Phone,
    string? Role,
    string? Address,
    decimal? Latitude,
    decimal? Longitude
);
