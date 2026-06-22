using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class BulkItemRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task AddBulkItem(int serviceId, string name, int includedCount, decimal? maxWeightKg, decimal price, string? imageUrl, string? description)
    {
        SqlParameter[] parameters =
        [
            new("@ServiceId", serviceId),
            new("@Name", name),
            new("@IncludedCount", includedCount),
            new("@MaxWeightKg", (object?)maxWeightKg ?? DBNull.Value),
            new("@Price", price),
            new("@ImageUrl", (object?)imageUrl ?? DBNull.Value),
            new("@Description", (object?)description ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("sp_AddBulkItem", parameters);
    }

    public Task<List<BulkItem>> GetBulkItems(int serviceId)
    {
        SqlParameter[] parameters = [new("@ServiceId", serviceId)];

        return _sql.ExecuteListAsync(
            "sp_GetBulkItems",
            parameters,
            MapBulkItem,
            CommandType.StoredProcedure);
    }

    public Task<List<BulkItem>> GetProviderBulkItems(int serviceId)
    {
        SqlParameter[] parameters = [new("@ServiceId", serviceId)];

        return _sql.ExecuteListAsync(
            "sp_GetProviderBulkItems",
            parameters,
            MapBulkItem,
            CommandType.StoredProcedure);
    }

    public Task UpdateBulkItem(int bulkItemId, int serviceId, string name, int includedCount, decimal? maxWeightKg, decimal price, string? imageUrl, string? description)
    {
        SqlParameter[] parameters =
        [
            new("@BulkItemId", bulkItemId),
            new("@ServiceId", serviceId),
            new("@Name", name),
            new("@IncludedCount", includedCount),
            new("@MaxWeightKg", (object?)maxWeightKg ?? DBNull.Value),
            new("@Price", price),
            new("@ImageUrl", (object?)imageUrl ?? DBNull.Value),
            new("@Description", (object?)description ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("sp_UpdateBulkItem", parameters);
    }

    public Task DeleteBulkItem(int bulkItemId)
    {
        SqlParameter[] parameters = [new("@BulkItemId", bulkItemId)];
        return _sql.ExecuteAsync("sp_DeleteBulkItem", parameters);
    }

    public Task RestoreBulkItem(int bulkItemId)
    {
        SqlParameter[] parameters = [new("@BulkItemId", bulkItemId)];
        return _sql.ExecuteAsync("sp_RestoreBulkItem", parameters);
    }

    private static BulkItem MapBulkItem(SqlDataReader reader) => new()
    {
        BulkItemId = reader.GetInt32(reader.GetOrdinal("BulkItemId")),
        ServiceId = reader.GetInt32(reader.GetOrdinal("ServiceId")),
        Name = reader.GetString(reader.GetOrdinal("Name")),
        IncludedCount = reader.GetInt32(reader.GetOrdinal("IncludedCount")),
        MaxWeightKg = reader.IsDBNull(reader.GetOrdinal("MaxWeightKg")) ? null : reader.GetDecimal(reader.GetOrdinal("MaxWeightKg")),
        Price = reader.GetDecimal(reader.GetOrdinal("Price")),
        ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl")) ? null : reader.GetString(reader.GetOrdinal("ImageUrl")),
        Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
        IsAvailable = SqlReaderExtensions.ReadBoolColumn(reader, "IsAvailable") ?? true
    };
}
