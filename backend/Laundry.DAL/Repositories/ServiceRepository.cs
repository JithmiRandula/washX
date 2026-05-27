using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Laundry.DAL.Repositories;

public sealed class ServiceRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task<int?> GetProviderIdForService(int serviceId)
    {
        SqlParameter[] parameters =
        [
            new("@ServiceId", serviceId)
        ];

        return _sql.ExecuteScalarAsync<int?>(
            "SELECT ProviderId FROM Services WHERE ServiceId = @ServiceId",
            parameters);
    }

    public Task AddService(int providerId, Service service)
    {
        SqlParameter[] parameters =
        [
            new("@ProviderId", providerId),
            new("@ServiceName", service.ServiceName),
            new("@Category", service.Category),
            new("@PricingType", service.PricingType),
            new("@Price", service.Price),
            new("@MinimumOrder", service.MinimumOrder),
            new("@TurnaroundTime", (object?)service.TurnaroundTime ?? DBNull.Value),
            new("@Description", (object?)service.Description ?? DBNull.Value),
            new("@KeyFeatures", (object?)service.KeyFeatures ?? DBNull.Value),
            new("@SpecialInstructions", (object?)service.SpecialInstructions ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("sp_AddService", parameters);
    }

    public Task<List<Service>> GetAllServices()
    {
        return _sql.ExecuteListAsync(
            "sp_GetAllServices",
            parameters: null,
            map: reader => new Service
            {
                ServiceId = reader.GetInt32(reader.GetOrdinal("ServiceId")),
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                ProviderBusinessName = reader.IsDBNull(reader.GetOrdinal("BusinessName"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("BusinessName")),
                ServiceName = reader.GetString(reader.GetOrdinal("ServiceName")),
                Category = reader.GetString(reader.GetOrdinal("Category")),
                PricingType = reader.GetString(reader.GetOrdinal("PricingType")),
                Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                MinimumOrder = reader.GetInt32(reader.GetOrdinal("MinimumOrder")),
                TurnaroundTime = reader.IsDBNull(reader.GetOrdinal("TurnaroundTime"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("TurnaroundTime")),
                Description = reader.IsDBNull(reader.GetOrdinal("Description"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("Description")),
                KeyFeatures = reader.IsDBNull(reader.GetOrdinal("KeyFeatures"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("KeyFeatures")),
                SpecialInstructions = reader.IsDBNull(reader.GetOrdinal("SpecialInstructions"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("SpecialInstructions"))
            },
            commandType: CommandType.StoredProcedure);
    }

    public Task<List<Service>> GetServicesByProviderId(int providerId)
    {
        SqlParameter[] parameters =
        [
            new("@ProviderId", providerId)
        ];

        return _sql.ExecuteListAsync(
            commandText: @"SELECT
    ServiceId,
    ProviderId,
    ServiceName,
    Category,
    PricingType,
    Price,
    MinimumOrder,
    TurnaroundTime,
    Description,
    KeyFeatures,
    SpecialInstructions
FROM Services
WHERE ProviderId = @ProviderId
ORDER BY ServiceId DESC",
            parameters: parameters,
            map: reader => new Service
            {
                ServiceId = reader.GetInt32(reader.GetOrdinal("ServiceId")),
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                ServiceName = reader.GetString(reader.GetOrdinal("ServiceName")),
                Category = reader.GetString(reader.GetOrdinal("Category")),
                PricingType = reader.GetString(reader.GetOrdinal("PricingType")),
                Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                MinimumOrder = reader.GetInt32(reader.GetOrdinal("MinimumOrder")),
                TurnaroundTime = reader.IsDBNull(reader.GetOrdinal("TurnaroundTime"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("TurnaroundTime")),
                Description = reader.IsDBNull(reader.GetOrdinal("Description"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("Description")),
                KeyFeatures = reader.IsDBNull(reader.GetOrdinal("KeyFeatures"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("KeyFeatures")),
                SpecialInstructions = reader.IsDBNull(reader.GetOrdinal("SpecialInstructions"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("SpecialInstructions"))
            },
            commandType: CommandType.Text);
    }

    public Task<int> UpdateService(int serviceId, int providerId, Service service)
    {
        SqlParameter[] parameters =
        [
            new("@ServiceId", serviceId),
            new("@ProviderId", providerId),
            new("@ServiceName", service.ServiceName),
            new("@Category", service.Category),
            new("@PricingType", service.PricingType),
            new("@Price", service.Price),
            new("@MinimumOrder", service.MinimumOrder),
            new("@TurnaroundTime", (object?)service.TurnaroundTime ?? DBNull.Value),
            new("@Description", (object?)service.Description ?? DBNull.Value),
            new("@KeyFeatures", (object?)service.KeyFeatures ?? DBNull.Value),
            new("@SpecialInstructions", (object?)service.SpecialInstructions ?? DBNull.Value)
        ];

        return _sql.ExecuteNonQueryAsync("sp_UpdateService", parameters, CommandType.StoredProcedure);
    }

    public Task<int> DeleteService(int serviceId)
    {
        SqlParameter[] parameters =
        [
            new("@ServiceId", serviceId)
        ];

        return _sql.ExecuteNonQueryAsync("sp_DeleteService", parameters, CommandType.StoredProcedure);
    }
}