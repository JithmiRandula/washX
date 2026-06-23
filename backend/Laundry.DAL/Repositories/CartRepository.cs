using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class CartRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task AddToCart(
        int customerId,
        int providerId,
        int? itemId = null,
        int? bulkItemId = null,
        string kind = "item",
        int quantity = 1,
        int? bags = null,
        decimal? maxKg = null,
        decimal? unitPrice = null,
        decimal? price = null,
        string? description = null)
    {
        SqlParameter[] parameters =
        [
            new("@CustomerId", customerId),
            new("@ProviderId", providerId),
            new("@ItemId", (object?)itemId ?? DBNull.Value),
            new("@BulkItemId", (object?)bulkItemId ?? DBNull.Value),
            new("@Kind", kind),
            new("@Quantity", quantity),
            new("@Bags", (object?)bags ?? DBNull.Value),
            new("@MaxKg", (object?)maxKg ?? DBNull.Value),
            new("@UnitPrice", (object?)unitPrice ?? DBNull.Value),
            new("@Price", (object?)price ?? DBNull.Value),
            new("@Description", (object?)description ?? DBNull.Value)
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

    private static CartItemDetail MapCartItem(SqlDataReader reader)
    {
        var detail = new CartItemDetail();

        detail.CartItemId = reader.GetInt32(reader.GetOrdinal("CartItemId"));
        detail.CustomerId = reader.GetInt32(reader.GetOrdinal("CustomerId"));
        detail.ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId"));

        // ItemId may be NULL for bulk rows
        detail.ItemId = reader.HasColumn("ItemId") && !reader.IsDBNull(reader.GetOrdinal("ItemId"))
            ? reader.GetInt32(reader.GetOrdinal("ItemId"))
            : 0;

        detail.Quantity = reader.HasColumn("Quantity") ? reader.GetInt32(reader.GetOrdinal("Quantity")) : 1;
        detail.AddedAt = reader.HasColumn("AddedAt") && !reader.IsDBNull(reader.GetOrdinal("AddedAt"))
            ? reader.GetDateTime(reader.GetOrdinal("AddedAt"))
            : null;

        // Read item/service columns if present
        detail.ServiceTypeId = SqlReaderExtensions.ReadIntColumn(reader, "ServiceId", "ServiceTypeId");
        detail.ItemName = reader.HasColumn("ItemName") && !reader.IsDBNull(reader.GetOrdinal("ItemName"))
            ? reader.GetString(reader.GetOrdinal("ItemName"))
            : string.Empty;

        // Prefer the cart's Description column (CartDescription) if present
        if (reader.HasColumn("CartDescription") && !reader.IsDBNull(reader.GetOrdinal("CartDescription")))
            detail.Description = reader.GetString(reader.GetOrdinal("CartDescription"));
        else if (reader.HasColumn("Description") && !reader.IsDBNull(reader.GetOrdinal("Description")))
            detail.Description = reader.GetString(reader.GetOrdinal("Description"));

        // Price: prefer cart row Price, fallback to item price
        if (reader.HasColumn("Price") && !reader.IsDBNull(reader.GetOrdinal("Price")))
            detail.Price = reader.GetDecimal(reader.GetOrdinal("Price"));
        else if (reader.HasColumn("ItemPrice") && !reader.IsDBNull(reader.GetOrdinal("ItemPrice")))
            detail.Price = reader.GetDecimal(reader.GetOrdinal("ItemPrice"));

        detail.ImageUrl = reader.HasColumn("ImageUrl") && !reader.IsDBNull(reader.GetOrdinal("ImageUrl"))
            ? reader.GetString(reader.GetOrdinal("ImageUrl"))
            : null;

        detail.ProviderName = reader.HasColumn("ProviderName") && !reader.IsDBNull(reader.GetOrdinal("ProviderName"))
            ? reader.GetString(reader.GetOrdinal("ProviderName"))
            : null;

        return detail;
    }
}
