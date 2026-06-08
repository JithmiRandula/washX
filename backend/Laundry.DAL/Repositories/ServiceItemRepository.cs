using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class ServiceItemRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task AddServiceItem(int serviceId, string itemName, string? description, decimal price, string? imageUrl)
    {
        SqlParameter[] parameters =
        [
            new("@ServiceId", serviceId),
            new("@ItemName", itemName),
            new("@Description", (object?)description ?? DBNull.Value),
            new("@Price", price),
            new("@ImageUrl", (object?)imageUrl ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("sp_AddServiceItem", parameters);
    }

    public Task<List<ServiceItem>> GetServiceItems(int serviceId)
    {
        SqlParameter[] parameters = [new("@ServiceId", serviceId)];

        return _sql.ExecuteListAsync(
            "sp_GetServiceItems",
            parameters,
            MapServiceItem,
            CommandType.StoredProcedure);
    }

    public Task<List<ServiceItem>> GetProviderServiceItems(int serviceId)
    {
        SqlParameter[] parameters = [new("@ServiceId", serviceId)];

        return _sql.ExecuteListAsync(
            "sp_GetProviderServiceItems",
            parameters,
            MapServiceItem,
            CommandType.StoredProcedure);
    }

    public Task UpdateServiceItem(int itemId, int serviceId, string itemName, string? description, decimal price, string? imageUrl)
    {
        SqlParameter[] parameters =
        [
            new("@ItemId", itemId),
            new("@ServiceId", serviceId),
            new("@ItemName", itemName),
            new("@Description", (object?)description ?? DBNull.Value),
            new("@Price", price),
            new("@ImageUrl", (object?)imageUrl ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("sp_UpdateServiceItem", parameters);
    }

    public Task DeleteServiceItem(int itemId, int serviceId)
    {
        SqlParameter[] parameters =
        [
            new("@ItemId", itemId),
            new("@ServiceId", serviceId)
        ];

        return _sql.ExecuteAsync("sp_DeleteServiceItem", parameters);
    }

    public Task RestoreServiceItem(int itemId, int serviceId)
    {
        SqlParameter[] parameters =
        [
            new("@ItemId", itemId),
            new("@ServiceId", serviceId)
        ];

        return _sql.ExecuteAsync("sp_RestoreServiceItem", parameters);
    }

    private static ServiceItem MapServiceItem(SqlDataReader reader) => new()
    {
        ItemId = reader.GetInt32(reader.GetOrdinal("ItemId")),
        ServiceId = SqlReaderExtensions.ReadIntColumn(reader, "ServiceId", "ServiceTypeId"),
        ItemName = reader.GetString(reader.GetOrdinal("ItemName")),
        Description = reader.IsDBNull(reader.GetOrdinal("Description"))
            ? null
            : reader.GetString(reader.GetOrdinal("Description")),
        Price = reader.GetDecimal(reader.GetOrdinal("Price")),
        ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl"))
            ? null
            : reader.GetString(reader.GetOrdinal("ImageUrl")),
        IsAvailable = SqlReaderExtensions.ReadBoolColumn(reader, "IsAvailable") ?? true
    };
}
