using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Laundry.DAL.Repositories;

public sealed class ServiceRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task AddService(Service service)
    {
        SqlParameter[] parameters =
        [
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

    public Task<int> UpdateService(int serviceId, Service service)
    {
        SqlParameter[] parameters =
        [
            new("@ServiceId", serviceId),
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