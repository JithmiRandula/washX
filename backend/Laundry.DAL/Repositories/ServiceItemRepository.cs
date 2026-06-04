using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class ServiceItemRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task AddServiceItem(int serviceTypeId, string itemName, string? description, decimal price, string? imageUrl)
    {
        SqlParameter[] parameters =
        [
            new("@ServiceTypeId", serviceTypeId),
            new("@ItemName", itemName),
            new("@Description", (object?)description ?? DBNull.Value),
            new("@Price", price),
            new("@ImageUrl", (object?)imageUrl ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("SP_AddServiceItem", parameters);
    }

    public Task<List<ServiceItem>> GetServiceItems(int serviceTypeId)
    {
        SqlParameter[] parameters = [new("@ServiceTypeId", serviceTypeId)];

        return _sql.ExecuteListAsync(
            "SP_GetServiceItems",
            parameters,
            MapServiceItem,
            CommandType.StoredProcedure);
    }

    public Task UpdateServiceItem(int itemId, int serviceTypeId, string itemName, string? description, decimal price, string? imageUrl)
    {
        SqlParameter[] parameters =
        [
            new("@ItemId", itemId),
            new("@ServiceTypeId", serviceTypeId),
            new("@ItemName", itemName),
            new("@Description", (object?)description ?? DBNull.Value),
            new("@Price", price),
            new("@ImageUrl", (object?)imageUrl ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("SP_UpdateServiceItem", parameters);
    }

    public Task DeleteServiceItem(int itemId, int serviceTypeId)
    {
        SqlParameter[] parameters =
        [
            new("@ItemId", itemId),
            new("@ServiceTypeId", serviceTypeId)
        ];

        return _sql.ExecuteAsync("SP_DeleteServiceItem", parameters);
    }

    private static ServiceItem MapServiceItem(SqlDataReader reader) => new()
    {
        ItemId = reader.GetInt32(reader.GetOrdinal("ItemId")),
        ServiceTypeId = reader.GetInt32(reader.GetOrdinal("ServiceTypeId")),
        ItemName = reader.GetString(reader.GetOrdinal("ItemName")),
        Description = reader.IsDBNull(reader.GetOrdinal("Description"))
            ? null
            : reader.GetString(reader.GetOrdinal("Description")),
        Price = reader.GetDecimal(reader.GetOrdinal("Price")),
        ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl"))
            ? null
            : reader.GetString(reader.GetOrdinal("ImageUrl")),
        CreatedAt = reader.IsDBNull(reader.GetOrdinal("CreatedAt"))
            ? null
            : reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
    };
}
