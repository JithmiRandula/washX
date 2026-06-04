using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class CartRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task AddToCart(int customerId, int providerId, int itemId)
    {
        SqlParameter[] parameters =
        [
            new("@CustomerId", customerId),
            new("@ProviderId", providerId),
            new("@ItemId", itemId)
        ];

        return _sql.ExecuteAsync("SP_AddToCart", parameters);
    }

    public Task<List<CartItemDetail>> GetCartItems(int customerId)
    {
        SqlParameter[] parameters = [new("@CustomerId", customerId)];

        return _sql.ExecuteListAsync(
            "SP_GetCartItems",
            parameters,
            MapCartItem,
            CommandType.StoredProcedure);
    }

    public Task IncreaseCartQuantity(int cartItemId)
    {
        SqlParameter[] parameters = [new("@CartItemId", cartItemId)];
        return _sql.ExecuteAsync("SP_IncreaseCartQuantity", parameters);
    }

    public Task DecreaseCartQuantity(int cartItemId)
    {
        SqlParameter[] parameters = [new("@CartItemId", cartItemId)];
        return _sql.ExecuteAsync("SP_DecreaseCartQuantity", parameters);
    }

    public Task DeleteCartItem(int cartItemId, int customerId)
    {
        SqlParameter[] parameters =
        [
            new("@CartItemId", cartItemId),
            new("@CustomerId", customerId)
        ];

        return _sql.ExecuteAsync("SP_DeleteCartItem", parameters);
    }

    public Task ClearCartByCustomer(int customerId)
    {
        SqlParameter[] parameters = [new("@CustomerId", customerId)];
        return _sql.ExecuteAsync("SP_ClearCartByCustomer", parameters);
    }

    private static CartItemDetail MapCartItem(SqlDataReader reader) => new()
    {
        CartItemId = reader.GetInt32(reader.GetOrdinal("CartItemId")),
        CustomerId = reader.GetInt32(reader.GetOrdinal("CustomerId")),
        ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
        ItemId = reader.GetInt32(reader.GetOrdinal("ItemId")),
        Quantity = reader.GetInt32(reader.GetOrdinal("Quantity")),
        AddedAt = reader.IsDBNull(reader.GetOrdinal("AddedAt"))
            ? null
            : reader.GetDateTime(reader.GetOrdinal("AddedAt")),
        ServiceTypeId = SqlReaderExtensions.ReadIntColumn(reader, "ServiceId", "ServiceTypeId"),
        ItemName = reader.GetString(reader.GetOrdinal("ItemName")),
        Description = reader.IsDBNull(reader.GetOrdinal("Description"))
            ? null
            : reader.GetString(reader.GetOrdinal("Description")),
        Price = reader.GetDecimal(reader.GetOrdinal("Price")),
        ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl"))
            ? null
            : reader.GetString(reader.GetOrdinal("ImageUrl")),
        ProviderName = reader.IsDBNull(reader.GetOrdinal("ProviderName"))
            ? null
            : reader.GetString(reader.GetOrdinal("ProviderName"))
    };
}
