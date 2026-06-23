using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class OrderRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    // ── Inline SQL fragments shared by list and detail queries ──────────────

    // Subquery: comma-separated distinct provider names for an order.
    // Uses STUFF + FOR XML PATH — works on SQL Server 2012+, no SP required.
    private const string ProviderNamesSub = @"
        ISNULL(
            STUFF((
                SELECT DISTINCT ', ' + p2.BusinessName
                FROM dbo.OrderItems oi2
                INNER JOIN dbo.Providers p2 ON p2.ProviderId = oi2.ProviderId
                WHERE oi2.OrderId = o.OrderId
                FOR XML PATH('')
            ), 1, 2, ''),
        '') ";

    // Subquery: total item count for an order.
    private const string ItemCountSub =
        "(SELECT COUNT(*) FROM dbo.OrderItems oi WHERE oi.OrderId = o.OrderId)";

    // Derived overall status — uses correlated subqueries, no GROUP BY / STRING_AGG.
    private const string OverallStatusExpr = @"
        CASE
            WHEN (SELECT COUNT(*) FROM dbo.OrderItems oi WHERE oi.OrderId = o.OrderId) = 0
                THEN 'pending'
            WHEN (SELECT COUNT(*) FROM dbo.OrderItems oi WHERE oi.OrderId = o.OrderId AND oi.Status = 'completed')
               = (SELECT COUNT(*) FROM dbo.OrderItems oi WHERE oi.OrderId = o.OrderId)
                THEN 'completed'
            WHEN EXISTS (SELECT 1 FROM dbo.OrderItems oi WHERE oi.OrderId = o.OrderId AND oi.Status = 'in-progress')
                THEN 'in-progress'
            WHEN o.PaymentStatus = 'Paid'
                THEN 'confirmed'
            ELSE 'pending'
        END ";

    // ── Write operations (inline SQL — no stored procedures required) ────────

    public async Task<int> AddOrder(Order order)
    {
        const string sql = @"
            INSERT INTO dbo.Orders
                (OrderReference, CustomerId, TotalAmount, PaymentProvider, PaymentStatus, Notes)
            OUTPUT INSERTED.OrderId
            VALUES
                (@OrderReference, @CustomerId, @TotalAmount, @PaymentProvider, @PaymentStatus, @Notes)";

        SqlParameter[] parameters = [
            new("@OrderReference",  order.OrderReference),
            new("@CustomerId",      order.CustomerId),
            new("@TotalAmount",     order.TotalAmount),
            new("@PaymentProvider", (object?)order.PaymentProvider ?? DBNull.Value),
            new("@PaymentStatus",   (object?)order.PaymentStatus   ?? DBNull.Value),
            new("@Notes",           (object?)order.Notes           ?? DBNull.Value)
        ];

        return await _sql.ExecuteScalarAsync<int>(sql, parameters, CommandType.Text);
    }

    public Task AddOrderItem(int orderId, OrderItem item)
    {
        const string sql = @"
            INSERT INTO dbo.OrderItems
                (OrderId, ProviderId, ServiceId, ItemId, Kind, Quantity, UnitPrice, Price, Description, Status)
            VALUES
                (@OrderId, @ProviderId, @ServiceId, @ItemId, @Kind, @Quantity, @UnitPrice, @Price, @Description, @Status)";

        SqlParameter[] parameters = [
            new("@OrderId",     orderId),
            new("@ProviderId",  item.ProviderId),
            new("@ServiceId",   (object?)item.ServiceId  ?? DBNull.Value),
            new("@ItemId",      (object?)item.ItemId     ?? DBNull.Value),
            new("@Kind",        string.IsNullOrEmpty(item.Kind) ? "item" : item.Kind),
            new("@Quantity",    item.Quantity),
            new("@UnitPrice",   item.UnitPrice),
            new("@Price",       item.Price),
            new("@Description", (object?)item.Description ?? DBNull.Value),
            new("@Status",      item.Status ?? "pending")
        ];

        return _sql.ExecuteNonQueryAsync(sql, parameters, CommandType.Text);
    }

    // ── Customer read operations ─────────────────────────────────────────────

    // List view — no SP, no STRING_AGG, works on SQL Server 2012+
    public Task<List<Order>> GetOrdersByCustomer(int customerId)
    {
        var sql = $@"
            SELECT
                o.OrderId,
                o.OrderReference,
                o.CustomerId,
                o.TotalAmount,
                o.PaymentStatus,
                o.PaymentProvider,
                o.Notes,
                o.CreatedAt,
                {ItemCountSub} AS ItemCount,
                {ProviderNamesSub} AS ProviderNames,
                {OverallStatusExpr} AS OverallStatus
            FROM dbo.Orders o
            WHERE o.CustomerId = @CustomerId
            ORDER BY o.CreatedAt DESC";

        SqlParameter[] parameters = [new("@CustomerId", customerId)];
        return _sql.ExecuteListAsync(sql, parameters, MapOrderSummary);
    }

    // Detail view — order header + items with names joined from ServiceItems / BulkItems
    public async Task<Order?> GetOrderById(int orderId)
    {
        SqlParameter[] parameters = [new("@OrderId", orderId)];

        var headerSql = $@"
            SELECT
                o.OrderId,
                o.OrderReference,
                o.CustomerId,
                o.TotalAmount,
                o.PaymentProvider,
                o.PaymentStatus,
                o.Notes,
                o.CreatedAt,
                {ItemCountSub} AS ItemCount,
                {ProviderNamesSub} AS ProviderNames,
                {OverallStatusExpr} AS OverallStatus
            FROM dbo.Orders o
            WHERE o.OrderId = @OrderId";

        var order = await _sql.ExecuteSingleAsync(headerSql, parameters, MapOrderSummary);
        if (order is null) return null;

        const string itemsSql = @"
            SELECT
                oi.OrderItemId,
                oi.OrderId,
                oi.ProviderId,
                oi.ServiceId,
                oi.ItemId,
                oi.Kind,
                oi.Quantity,
                oi.UnitPrice,
                oi.Price,
                oi.Description,
                oi.Status,
                oi.CreatedAt,
                p.BusinessName AS ProviderName,
                CASE
                    WHEN oi.Kind = 'item' THEN COALESCE(si.ItemName, oi.Description)
                    WHEN oi.Kind = 'bulk' THEN COALESCE(b.Name,      oi.Description)
                    ELSE oi.Description
                END AS ItemName,
                CASE
                    WHEN oi.Kind = 'item' THEN si.ImageUrl
                    WHEN oi.Kind = 'bulk' THEN b.ImageUrl
                    ELSE NULL
                END AS ImageUrl
            FROM dbo.OrderItems oi
            LEFT JOIN dbo.Providers    p  ON p.ProviderId = oi.ProviderId
            LEFT JOIN dbo.ServiceItems si ON si.ItemId    = oi.ItemId AND oi.Kind = 'item'
            LEFT JOIN dbo.BulkItems    b  ON b.BulkItemId = oi.ItemId AND oi.Kind = 'bulk'
            WHERE oi.OrderId = @OrderId
            ORDER BY oi.OrderItemId";

        order.Items = await _sql.ExecuteListAsync(itemsSql, parameters, MapOrderItemDetailed);
        return order;
    }

    // ── Provider read & write operations ────────────────────────────────────

    public async Task<List<Order>> GetOrdersByProvider(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        var orders = await _sql.ExecuteListAsync("SP_GetOrdersByProvider", p, MapProviderOrder, CommandType.StoredProcedure);

        foreach (var order in orders)
        {
            SqlParameter[] p2 = [new("@OrderId", order.OrderId), new("@ProviderId", providerId)];
            order.Items = await _sql.ExecuteListAsync("SP_GetProviderOrderItems", p2, MapOrderItemDetailed, CommandType.StoredProcedure);
        }
        return orders;
    }

    // Accept (in-progress) / Reject (cancelled) / Complete (completed)
    public Task<int> UpdateOrderStatusByProvider(int orderId, int providerId, string status)
    {
        SqlParameter[] p =
        [
            new("@OrderId",    orderId),
            new("@ProviderId", providerId),
            new("@Status",     status)
        ];
        return _sql.ExecuteNonQueryAsync("SP_UpdateOrderStatusByProvider", p, CommandType.StoredProcedure);
    }

    public async Task<int?> GetOrderItemProviderId(int orderItemId)
    {
        SqlParameter[] p = [new("@OrderItemId", orderItemId)];
        return await _sql.ExecuteSingleAsync(
            "SELECT ProviderId FROM dbo.OrderItems WHERE OrderItemId = @OrderItemId",
            p, r => r.GetInt32(0));
    }

    public Task<int> UpdateOrderItemStatus(int orderItemId, string status)
    {
        SqlParameter[] p = [new("@OrderItemId", orderItemId), new("@Status", status)];
        return _sql.ExecuteNonQueryAsync("SP_UpdateOrderItemStatus", p, CommandType.StoredProcedure);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static Order MapOrderSummary(SqlDataReader r) => new()
    {
        OrderId         = r.GetInt32(r.GetOrdinal("OrderId")),
        OrderReference  = r.GetString(r.GetOrdinal("OrderReference")),
        CustomerId      = r.GetInt32(r.GetOrdinal("CustomerId")),
        TotalAmount     = r.GetDecimal(r.GetOrdinal("TotalAmount")),
        PaymentProvider = NullStr(r, "PaymentProvider"),
        PaymentStatus   = NullStr(r, "PaymentStatus"),
        Notes           = NullStr(r, "Notes"),
        CreatedAt       = NullDt(r, "CreatedAt"),
        ItemCount       = NullInt(r, "ItemCount"),
        ProviderNames   = NullStr(r, "ProviderNames"),
        OverallStatus   = NullStr(r, "OverallStatus")
    };

    private static Order MapProviderOrder(SqlDataReader r) => new()
    {
        OrderId         = r.GetInt32(r.GetOrdinal("OrderId")),
        OrderReference  = r.GetString(r.GetOrdinal("OrderReference")),
        CustomerId      = r.GetInt32(r.GetOrdinal("CustomerId")),
        TotalAmount     = r.GetDecimal(r.GetOrdinal("TotalAmount")),
        PaymentProvider = NullStr(r, "PaymentProvider"),
        PaymentStatus   = NullStr(r, "PaymentStatus"),
        Notes           = NullStr(r, "Notes"),
        CreatedAt       = NullDt(r, "CreatedAt"),
        CustomerName    = NullStr(r, "CustomerName"),
        CustomerPhone   = NullStr(r, "CustomerPhone"),
        CustomerAddress = NullStr(r, "CustomerAddress"),
        ItemCount       = NullInt(r, "ItemCount"),
        ProviderStatus  = NullStr(r, "ProviderStatus")
    };


    private static OrderItem MapOrderItemDetailed(SqlDataReader r) => new()
    {
        OrderItemId  = r.GetInt32(r.GetOrdinal("OrderItemId")),
        OrderId      = r.GetInt32(r.GetOrdinal("OrderId")),
        ProviderId   = r.GetInt32(r.GetOrdinal("ProviderId")),
        ServiceId    = NullInt(r, "ServiceId"),
        ItemId       = NullInt(r, "ItemId"),
        Kind         = r.GetString(r.GetOrdinal("Kind")),
        Quantity     = r.GetInt32(r.GetOrdinal("Quantity")),
        UnitPrice    = r.GetDecimal(r.GetOrdinal("UnitPrice")),
        Price        = r.GetDecimal(r.GetOrdinal("Price")),
        Description  = NullStr(r, "Description"),
        Status       = NullStr(r, "Status") ?? "pending",
        CreatedAt    = NullDt(r, "CreatedAt"),
        ProviderName = NullStr(r, "ProviderName"),
        ItemName     = NullStr(r, "ItemName"),
        ImageUrl     = NullStr(r, "ImageUrl")
    };

    private static int? NullInt(SqlDataReader r, string col)
    {
        try { var o = r.GetOrdinal(col); return r.IsDBNull(o) ? null : r.GetInt32(o); }
        catch (IndexOutOfRangeException) { return null; }
    }

    private static string? NullStr(SqlDataReader r, string col)
    {
        try { var o = r.GetOrdinal(col); return r.IsDBNull(o) ? null : r.GetString(o); }
        catch (IndexOutOfRangeException) { return null; }
    }

    private static DateTime? NullDt(SqlDataReader r, string col)
    {
        try { var o = r.GetOrdinal(col); return r.IsDBNull(o) ? null : r.GetDateTime(o); }
        catch (IndexOutOfRangeException) { return null; }
    }
}
