using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class ProviderRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task<ProviderProfile?> GetProviderProfile(int providerId)
    {
        SqlParameter[] parameters =
        [
            new("@ProviderId", providerId)
        ];

        return _sql.ExecuteSingleAsync(
            "sp_GetProviderProfile",
            parameters,
            map: reader => new ProviderProfile
            {
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Phone = reader.GetString(reader.GetOrdinal("Phone")),
                BusinessName = reader.GetString(reader.GetOrdinal("BusinessName")),
                BusinessAddress = reader.IsDBNull(reader.GetOrdinal("BusinessAddress"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("BusinessAddress")),
                Latitude = reader.IsDBNull(reader.GetOrdinal("Latitude"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Latitude")),
                Longitude = reader.IsDBNull(reader.GetOrdinal("Longitude"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Longitude")),
                Description = reader.IsDBNull(reader.GetOrdinal("Description"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("Description")),
                Rating = reader.GetDecimal(reader.GetOrdinal("Rating")),
                IsVerified = reader.GetBoolean(reader.GetOrdinal("IsVerified")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            },
            commandType: CommandType.StoredProcedure);
    }
}
