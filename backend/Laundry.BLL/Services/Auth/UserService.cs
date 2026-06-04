using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Auth;

public sealed class AddressParts
{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
}

public sealed class UserService(UserRepository repo, TokenService tokenService)
{
    private readonly UserRepository _repo = repo;
    private readonly TokenService _tokenService = tokenService;

    public async Task<bool> Register(User user, string? address, decimal? latitude, decimal? longitude)
    {

        if (string.IsNullOrWhiteSpace(user.Email))
            throw new Exception("Email required");

        if (string.IsNullOrWhiteSpace(user.PasswordHash))
            throw new Exception("Password required");

        if (string.IsNullOrWhiteSpace(user.Role))
            throw new Exception("Role required");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

        var userId = await _repo.RegisterUser(user);

        if (user.Role.Equals("customer", StringComparison.OrdinalIgnoreCase))
        {
            await _repo.CreateCustomerProfile(userId, address, latitude, longitude);
            return true;
        }

        if (user.Role.Equals("provider", StringComparison.OrdinalIgnoreCase))
        {
            await _repo.CreateProviderProfile(userId, user.Name, address, latitude, longitude, "New provider - Please update your business profile");
            return true;
        }

        return true;
    }

    public async Task<object?> Login(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return null;

        var user = await _repo.GetUserByEmail(email);
        if (user is null)
            return null;

        var valid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!valid)
            return null;

        var token = _tokenService.CreateToken(user);

        int? providerId = null;
        int? customerId = null;

        if (user.Role.Equals("provider", StringComparison.OrdinalIgnoreCase))
        {
            providerId = await _repo.GetProviderIdByUserId(user.UserId);
        }
        else if (user.Role.Equals("customer", StringComparison.OrdinalIgnoreCase))
        {
            customerId = await _repo.GetCustomerIdByUserId(user.UserId);
        }

        return new
        {
            success = true,
            user = new
            {
                id = user.UserId,
                name = user.Name,
                email = user.Email,
                phone = user.Phone,
                role = user.Role
            },
            token,
            providerId,
            customerId
        };
    }


    public async Task<object?> GetCurrentUserAsync(int userId)
    {
        var user = await _repo.GetUserById(userId);
        if (user is null)
            return null;

        int? providerId = null;
        int? customerId = null;

        if (user.Role.Equals("provider", StringComparison.OrdinalIgnoreCase))
            providerId = await _repo.GetProviderIdByUserId(user.UserId);
        else if (user.Role.Equals("customer", StringComparison.OrdinalIgnoreCase))
            customerId = await _repo.GetCustomerIdByUserId(user.UserId);

        return new
        {
            success = true,
            user = new
            {
                id = user.UserId,
                name = user.Name,
                email = user.Email,
                phone = user.Phone,
                role = user.Role
            },
            providerId,
            customerId
        };
    }

    public async Task<User> HandleGoogleLogin(string? name, string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required", nameof(email));

        name ??= string.Empty;

        // check if user already exists
        var user = await _repo.GetByEmail(email);

        if (user != null)
            return user;

        // create new Google user
        user = new User
        {
            Name = name,
            Email = email,
            Role = "customer", // default role
            PasswordHash = ""  // no password for Google users
        };

        await _repo.Add(user);

        return user;
    }

    public async Task<object?> GetCustomerProfile(int userId)
    {
        var row = await _repo.GetCustomerProfileByUserId(userId);
        if (row is null)
            return null;

        return MapProfileResponse(row);
    }

    public async Task<object?> UpdateCustomerProfile(int userId, string? name, string? phone, AddressParts? address)
    {
        var row = await _repo.GetCustomerProfileByUserId(userId);
        if (row is null)
            return null;

        var updatedName = string.IsNullOrWhiteSpace(name) ? row.Name : name.Trim();
        var updatedPhone = phone ?? row.Phone;

        await _repo.UpdateUserProfile(userId, updatedName, updatedPhone);

        if (address is not null)
        {
            var addressLine = FormatAddress(address);
            await _repo.UpdateCustomerAddress(userId, addressLine);
        }

        var updated = await _repo.GetCustomerProfileByUserId(userId);
        return updated is null ? null : MapProfileResponse(updated);
    }

    private static object MapProfileResponse(CustomerUserProfile row) => new
    {
        customerId = row.CustomerId,
        name = row.Name,
        email = row.Email,
        phone = row.Phone,
        dateOfBirth = (string?)null,
        gender = (string?)null,
        address = ParseAddress(row.Address),
        avatar = (string?)null,
        preferences = new
        {
            notifications = true,
            emailUpdates = true,
            smsAlerts = false,
            promotionalEmails = false
        },
        googleId = row.HasPassword ? (string?)null : "google",
        paymentMethods = Array.Empty<object>()
    };

    private static object ParseAddress(string? address)
    {
        if (string.IsNullOrWhiteSpace(address))
        {
            return new { street = "", city = "", state = "", zipCode = "" };
        }

        return new { street = address, city = "", state = "", zipCode = "" };
    }

    private static string? FormatAddress(AddressParts address)
    {
        var parts = new[]
        {
            address.Street?.Trim(),
            address.City?.Trim(),
            address.State?.Trim(),
            address.ZipCode?.Trim()
        }.Where(p => !string.IsNullOrWhiteSpace(p));

        var line = string.Join(", ", parts);
        return string.IsNullOrWhiteSpace(line) ? null : line;
    }
}
