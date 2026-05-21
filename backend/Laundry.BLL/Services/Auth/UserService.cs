using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Auth;

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
            token
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


}
