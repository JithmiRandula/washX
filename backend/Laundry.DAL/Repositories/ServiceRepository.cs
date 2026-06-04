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
        SqlParameter[] parameters = [new("@ServiceId", serviceId)];

        return _sql.ExecuteScalarAsync<int?>(
            "SELECT ProviderId FROM Services WHERE ServiceId = @ServiceId AND IsActive = 1",
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
            new("@BasePrice", service.Price),
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
            """
            SELECT
                s.ServiceId,
                s.ProviderId,
                p.BusinessName,
                s.ServiceName,
                s.Category,
                s.PricingType,
                s.BasePrice,
                s.MinimumOrder,
                s.TurnaroundTime,
                s.Description,
                s.KeyFeatures,
                s.SpecialInstructions,
                s.IsActive
            FROM Services s
            INNER JOIN Providers p ON p.ProviderId = s.ProviderId
            WHERE s.IsActive = 1
            ORDER BY s.ServiceId DESC
            """,
            parameters: null,
            map: MapService,
            commandType: CommandType.Text);
    }

    public Task<List<Service>> GetServicesByProviderId(int providerId)
    {
        SqlParameter[] parameters = [new("@ProviderId", providerId)];

        return _sql.ExecuteListAsync(
            "sp_GetProviderServices",
            parameters,
            MapService,
            CommandType.StoredProcedure);
    }

    public Task<int> UpdateService(int serviceId, Service service)
    {
        SqlParameter[] parameters =
        [
            new("@ServiceId", serviceId),
            new("@ServiceName", service.ServiceName),
            new("@Category", service.Category),
            new("@PricingType", service.PricingType),
            new("@BasePrice", service.Price),
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
        SqlParameter[] parameters = [new("@ServiceId", serviceId)];
        return _sql.ExecuteNonQueryAsync("sp_DeleteService", parameters, CommandType.StoredProcedure);
    }

    private static Service MapService(SqlDataReader reader) => new()
    {
        ServiceId = reader.GetInt32(reader.GetOrdinal("ServiceId")),
        ProviderId = SqlReaderExtensions.ReadIntColumn(reader, "ProviderId"),
        ProviderBusinessName = reader.HasColumn("BusinessName") && !reader.IsDBNull(reader.GetOrdinal("BusinessName"))
            ? reader.GetString(reader.GetOrdinal("BusinessName"))
            : null,
        ServiceName = reader.GetString(reader.GetOrdinal("ServiceName")),
        Category = reader.GetString(reader.GetOrdinal("Category")),
        PricingType = reader.GetString(reader.GetOrdinal("PricingType")),
        Price = SqlReaderExtensions.ReadDecimalColumn(reader, "BasePrice", "Price"),
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
            : reader.GetString(reader.GetOrdinal("SpecialInstructions")),
        IsActive = SqlReaderExtensions.ReadBoolColumn(reader, "IsActive") ?? true
    };
}
