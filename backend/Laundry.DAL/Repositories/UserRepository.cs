using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class UserRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    // The following methods are used by Google OAuth flow.
    // They are implemented via stored procedures/queries in the database.
    public Task<User?> GetByEmail(string email) => GetUserByEmail(email);

    public async Task Add(User user)
    {
        await RegisterUser(user);
    }

 public async Task<int> RegisterUser(User user)
    {
        SqlParameter[] param =
        [
            new("@Name", user.Name),
            new("@Email", user.Email),
            new("@Phone", user.Phone),
            new("@PasswordHash", user.PasswordHash),
            new("@Role", user.Role)
        ];

     var userId = await _sql.ExecuteScalarAsync<int>("sp_RegisterUser", param, System.Data.CommandType.StoredProcedure);
        return userId;
    }

    public Task CreateCustomerProfile(int userId, string? address, decimal? latitude, decimal? longitude)
    {
        SqlParameter[] parameters =
      [
            new("@UserId", userId),
            new("@Address", (object?)address ?? DBNull.Value),
            new("@Latitude", (object?)latitude ?? DBNull.Value),
            new("@Longitude", (object?)longitude ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("sp_CreateCustomerProfile", parameters);
    }

    public Task CreateProviderProfile(int userId, string businessName, string? businessAddress, decimal? latitude, decimal? longitude, string? description)
    {
        SqlParameter[] parameters =
        [
            new("@UserId", userId),
            new("@BusinessName", businessName),
            new("@BusinessAddress", (object?)businessAddress ?? DBNull.Value),
            new("@Latitude", (object?)latitude ?? DBNull.Value),
            new("@Longitude", (object?)longitude ?? DBNull.Value),
            new("@Description", (object?)description ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("sp_CreateProviderProfile", parameters);
    }

    public Task<User?> GetUserByEmail(string email)
    {
        SqlParameter[] parameters =
        [
            new("@Email", email)
        ];

        return _sql.ExecuteSingleAsync(
            "sp_GetUserByEmail",
            parameters,
            reader => new User
            {
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Phone = reader.GetString(reader.GetOrdinal("Phone")),
                PasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash")),
                Role = reader.GetString(reader.GetOrdinal("Role")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt")) ? null : reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
            },
            System.Data.CommandType.StoredProcedure);
    }

    public Task<int?> GetProviderIdByUserId(int userId)
    {
        SqlParameter[] parameters =
        [
            new("@UserId", userId)
        ];

        return _sql.ExecuteScalarAsync<int?>(
            "SELECT ProviderId FROM Providers WHERE UserId = @UserId",
            parameters);
    }

    public Task<int?> GetCustomerIdByUserId(int userId)
    {
        SqlParameter[] parameters =
        [
            new("@UserId", userId)
        ];

        return _sql.ExecuteScalarAsync<int?>(
            "SELECT CustomerId FROM Customers WHERE UserId = @UserId",
            parameters);
    }

    public Task<CustomerUserProfile?> GetCustomerProfileByUserId(int userId)
    {
        SqlParameter[] parameters =
        [
            new("@UserId", userId)
        ];

        return _sql.ExecuteSingleAsync(
            """
            SELECT u.UserId, u.Name, u.Email, u.Phone, u.PasswordHash,
                   c.CustomerId, c.Address
            FROM Users u
            INNER JOIN Customers c ON c.UserId = u.UserId
            WHERE u.UserId = @UserId
            """,
            parameters,
            reader => new CustomerUserProfile
            {
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                CustomerId = reader.GetInt32(reader.GetOrdinal("CustomerId")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Phone = reader.GetString(reader.GetOrdinal("Phone")),
                Address = reader.IsDBNull(reader.GetOrdinal("Address"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("Address")),
                HasPassword = !reader.IsDBNull(reader.GetOrdinal("PasswordHash"))
                    && !string.IsNullOrWhiteSpace(reader.GetString(reader.GetOrdinal("PasswordHash")))
            });
    }

    public Task UpdateUserProfile(int userId, string name, string phone)
    {
        SqlParameter[] parameters =
        [
            new("@UserId", userId),
            new("@Name", name),
            new("@Phone", phone)
        ];

        return _sql.ExecuteNonQueryAsync(
            "UPDATE Users SET Name = @Name, Phone = @Phone, UpdatedAt = GETUTCDATE() WHERE UserId = @UserId",
            parameters);
    }

    public Task UpdateCustomerAddress(int userId, string? address)
    {
        SqlParameter[] parameters =
        [
            new("@UserId", userId),
            new("@Address", (object?)address ?? DBNull.Value)
        ];

        return _sql.ExecuteNonQueryAsync(
            "UPDATE Customers SET Address = @Address WHERE UserId = @UserId",
            parameters);
    }
}
