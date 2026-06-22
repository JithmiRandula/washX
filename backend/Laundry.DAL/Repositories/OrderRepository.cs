using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class OrderRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public async Task<int> AddOrder(Order order)
    {
        SqlParameter[] parameters = [
            new("@OrderReference", order.OrderReference),
            new("@CustomerId", order.CustomerId),
            new("@TotalAmount", order.TotalAmount),
            new("@PaymentProvider", (object?)order.PaymentProvider ?? DBNull.Value),
            new("@PaymentStatus", (object?)order.PaymentStatus ?? DBNull.Value),
            new("@Notes", (object?)order.Notes ?? DBNull.Value)
        ];

        var id = await _sql.ExecuteScalarAsync<int>("SP_AddOrder", parameters, CommandType.StoredProcedure);
        return id;
    }

    public Task AddOrderItem(int orderId, OrderItem item)
    {
        SqlParameter[] parameters = [
            new("@OrderId", orderId),
            new("@ProviderId", item.ProviderId),
            new("@ServiceId", (object?)item.ServiceId ?? DBNull.Value),
            new("@ItemId", (object?)item.ItemId ?? DBNull.Value),
            new("@Kind", item.Kind),
            new("@Quantity", item.Quantity),
            new("@UnitPrice", item.UnitPrice),
            new("@Price", item.Price),
            new("@Description", (object?)item.Description ?? DBNull.Value)
        ];

        return _sql.ExecuteAsync("SP_AddOrderItem", parameters);
    }

    public async Task<Order?> GetOrderById(int orderId)
    {
        SqlParameter[] parameters = [new("@OrderId", orderId)];

        // First result: order
        var order = await _sql.ExecuteSingleAsync("SP_GetOrderById", parameters, MapOrder, CommandType.StoredProcedure);
        if (order is null) return null;

        // Second result set: items - use ExecuteListAsync with same SP
        var items = await _sql.ExecuteListAsync("SELECT * FROM dbo.OrderItems WHERE OrderId = @OrderId", parameters, MapOrderItem, CommandType.Text);
        order.Items = items;
        return order;
    }

    private static Order MapOrder(SqlDataReader reader) => new()
    {
        OrderId = reader.GetInt32(reader.GetOrdinal("OrderId")),
        OrderReference = reader.GetString(reader.GetOrdinal("OrderReference")),
        CustomerId = reader.GetInt32(reader.GetOrdinal("CustomerId")),
        TotalAmount = reader.GetDecimal(reader.GetOrdinal("TotalAmount")),
        PaymentProvider = reader.IsDBNull(reader.GetOrdinal("PaymentProvider")) ? null : reader.GetString(reader.GetOrdinal("PaymentProvider")),
        PaymentStatus = reader.IsDBNull(reader.GetOrdinal("PaymentStatus")) ? null : reader.GetString(reader.GetOrdinal("PaymentStatus")),
        Notes = reader.IsDBNull(reader.GetOrdinal("Notes")) ? null : reader.GetString(reader.GetOrdinal("Notes")),
        CreatedAt = reader.IsDBNull(reader.GetOrdinal("CreatedAt")) ? null : reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
    };

    private static OrderItem MapOrderItem(SqlDataReader reader) => new()
    {
        OrderItemId = reader.GetInt32(reader.GetOrdinal("OrderItemId")),
        OrderId = reader.GetInt32(reader.GetOrdinal("OrderId")),
        ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
        ServiceId = reader.IsDBNull(reader.GetOrdinal("ServiceId")) ? null : reader.GetInt32(reader.GetOrdinal("ServiceId")),
        ItemId = reader.IsDBNull(reader.GetOrdinal("ItemId")) ? null : reader.GetInt32(reader.GetOrdinal("ItemId")),
        Kind = reader.GetString(reader.GetOrdinal("Kind")),
        Quantity = reader.GetInt32(reader.GetOrdinal("Quantity")),
        UnitPrice = reader.GetDecimal(reader.GetOrdinal("UnitPrice")),
        Price = reader.GetDecimal(reader.GetOrdinal("Price")),
        Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
        CreatedAt = reader.IsDBNull(reader.GetOrdinal("CreatedAt")) ? null : reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
    };
}
