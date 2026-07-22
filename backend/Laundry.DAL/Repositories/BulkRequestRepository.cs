using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class BulkRequestRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    private const string BaseSelect = """
        SELECT br.*, s.ServiceName, s.Description AS ServiceDescription,
               p.BusinessName AS ProviderName,
               u.Name AS CustomerName, u.Phone AS CustomerPhone
        FROM dbo.BulkRequests br
        INNER JOIN dbo.Services s  ON s.ServiceId  = br.ServiceId
        INNER JOIN dbo.Providers p ON p.ProviderId = br.ProviderId
        INNER JOIN dbo.Customers c ON c.CustomerId = br.CustomerId
        INNER JOIN dbo.Users u     ON u.UserId     = c.UserId
        """;

    // ── Create ───────────────────────────────────────────────────────────
    public async Task<int> Create(BulkRequest r)
    {
        SqlParameter[] p =
        [
            new("@RequestReference", r.RequestReference),
            new("@CustomerId",       r.CustomerId),
            new("@ProviderId",       r.ProviderId),
            new("@ServiceId",        r.ServiceId),
            new("@FulfillmentMethod",r.FulfillmentMethod),
            new("@Address",          (object?)r.Address ?? DBNull.Value),
            new("@PreferredDate",    (object?)r.PreferredDate ?? DBNull.Value),
            new("@PreferredSlot",    (object?)r.PreferredSlot ?? DBNull.Value),
            new("@Notes",            (object?)r.Notes ?? DBNull.Value),
            new("@PricePerKg",       r.PricePerKg)
        ];

        const string sqlText = """
            INSERT INTO dbo.BulkRequests
                (RequestReference, CustomerId, ProviderId, ServiceId, FulfillmentMethod,
                 Address, PreferredDate, PreferredSlot, Notes, Status, PricePerKg, CreatedAt)
            OUTPUT INSERTED.BulkRequestId
            VALUES
                (@RequestReference, @CustomerId, @ProviderId, @ServiceId, @FulfillmentMethod,
                 @Address, @PreferredDate, @PreferredSlot, @Notes, 'pending_request', @PricePerKg, GETDATE())
            """;

        return await _sql.ExecuteScalarAsync<int>(sqlText, p, CommandType.Text);
    }

    // ── Reads ────────────────────────────────────────────────────────────
    public Task<BulkRequest?> GetById(int id)
    {
        SqlParameter[] p = [new("@Id", id)];
        return _sql.ExecuteSingleAsync($"{BaseSelect} WHERE br.BulkRequestId = @Id", p, Map, CommandType.Text);
    }

    public Task<List<BulkRequest>> GetByCustomer(int customerId)
    {
        SqlParameter[] p = [new("@CustomerId", customerId)];
        return _sql.ExecuteListAsync(
            $"{BaseSelect} WHERE br.CustomerId = @CustomerId ORDER BY br.CreatedAt DESC",
            p, Map, CommandType.Text);
    }

    public Task<List<BulkRequest>> GetByProvider(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        return _sql.ExecuteListAsync(
            $"{BaseSelect} WHERE br.ProviderId = @ProviderId ORDER BY br.CreatedAt DESC",
            p, Map, CommandType.Text);
    }

    // Used to validate + snapshot the service's per-kg price and owning provider when a
    // customer starts a new request. Returns null if the service doesn't exist or isn't
    // priced per kg (i.e. it's an item-based service — not eligible for a bulk request).
    public Task<(int ProviderId, decimal PricePerKg, bool IsActive)?> GetServiceForBulkRequest(int serviceId)
    {
        SqlParameter[] p = [new("@ServiceId", serviceId)];
        return _sql.ExecuteSingleAsync<(int, decimal, bool)?>(
            """
            SELECT ProviderId, BasePrice, ISNULL(IsActive, 1) AS IsActive
            FROM dbo.Services
            WHERE ServiceId = @ServiceId AND PricingType LIKE '%kg%'
            """,
            p,
            r => (r.GetInt32(r.GetOrdinal("ProviderId")), r.GetDecimal(r.GetOrdinal("BasePrice")), r.GetBoolean(r.GetOrdinal("IsActive"))),
            CommandType.Text);
    }

    // ── Provider-driven status transitions ──────────────────────────────
    // Each transition's WHERE clause enforces the current status, so an out-of-order
    // call (e.g. weighing before receiving) simply affects 0 rows instead of corrupting state.

    public Task<int> Accept(int id, int providerId, string nextStatus)
    {
        SqlParameter[] p = [new("@Id", id), new("@ProviderId", providerId), new("@Status", nextStatus)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests SET Status = @Status, AcceptedAt = GETDATE()
            WHERE BulkRequestId = @Id AND ProviderId = @ProviderId AND Status = 'pending_request'
            """, p, CommandType.Text);
    }

    public Task<int> Reject(int id, int providerId)
    {
        SqlParameter[] p = [new("@Id", id), new("@ProviderId", providerId)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests SET Status = 'cancelled', CancelledAt = GETDATE()
            WHERE BulkRequestId = @Id AND ProviderId = @ProviderId
              AND Status IN ('pending_request', 'pickup_scheduled', 'awaiting_dropoff')
            """, p, CommandType.Text);
    }

    public Task<int> MarkReceived(int id, int providerId)
    {
        SqlParameter[] p = [new("@Id", id), new("@ProviderId", providerId)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests SET Status = 'received', ReceivedAt = GETDATE()
            WHERE BulkRequestId = @Id AND ProviderId = @ProviderId
              AND Status IN ('pickup_scheduled', 'awaiting_dropoff')
            """, p, CommandType.Text);
    }

    public Task<int> ConfirmWeight(int id, int providerId, decimal actualWeightKg, decimal finalPrice)
    {
        SqlParameter[] p =
        [
            new("@Id", id), new("@ProviderId", providerId),
            new("@Weight", actualWeightKg), new("@Price", finalPrice)
        ];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests
            SET Status = 'awaiting_confirmation', ActualWeightKg = @Weight, FinalPrice = @Price, WeighedAt = GETDATE()
            WHERE BulkRequestId = @Id AND ProviderId = @ProviderId AND Status = 'received'
            """, p, CommandType.Text);
    }

    public Task<int> StartProcessing(int id, int providerId)
    {
        SqlParameter[] p = [new("@Id", id), new("@ProviderId", providerId)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests SET Status = 'processing', ProcessingAt = GETDATE()
            WHERE BulkRequestId = @Id AND ProviderId = @ProviderId AND Status = 'paid'
            """, p, CommandType.Text);
    }

    public Task<int> MarkReady(int id, int providerId)
    {
        SqlParameter[] p = [new("@Id", id), new("@ProviderId", providerId)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests SET Status = 'ready', ReadyAt = GETDATE()
            WHERE BulkRequestId = @Id AND ProviderId = @ProviderId AND Status = 'processing'
            """, p, CommandType.Text);
    }

    public Task<int> Complete(int id, int providerId)
    {
        SqlParameter[] p = [new("@Id", id), new("@ProviderId", providerId)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests SET Status = 'completed', CompletedAt = GETDATE()
            WHERE BulkRequestId = @Id AND ProviderId = @ProviderId AND Status = 'ready'
            """, p, CommandType.Text);
    }

    // ── Customer-driven status transitions ──────────────────────────────
    public Task<int> CustomerConfirm(int id, int customerId)
    {
        SqlParameter[] p = [new("@Id", id), new("@CustomerId", customerId)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests SET Status = 'payment_pending', ConfirmedAt = GETDATE()
            WHERE BulkRequestId = @Id AND CustomerId = @CustomerId AND Status = 'awaiting_confirmation'
            """, p, CommandType.Text);
    }

    public Task<int> MarkPaid(int id, int customerId, string paymentProvider)
    {
        SqlParameter[] p = [new("@Id", id), new("@CustomerId", customerId), new("@Provider", paymentProvider)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests
            SET Status = 'paid', PaymentProvider = @Provider, PaymentStatus = 'Paid', PaidAt = GETDATE()
            WHERE BulkRequestId = @Id AND CustomerId = @CustomerId AND Status = 'payment_pending'
            """, p, CommandType.Text);
    }

    public Task<int> CustomerCancel(int id, int customerId)
    {
        SqlParameter[] p = [new("@Id", id), new("@CustomerId", customerId)];
        return _sql.ExecuteNonQueryAsync(
            """
            UPDATE dbo.BulkRequests SET Status = 'cancelled', CancelledAt = GETDATE()
            WHERE BulkRequestId = @Id AND CustomerId = @CustomerId
              AND Status IN ('pending_request', 'pickup_scheduled', 'awaiting_dropoff')
            """, p, CommandType.Text);
    }

    private static BulkRequest Map(SqlDataReader r) => new()
    {
        BulkRequestId     = r.GetInt32(r.GetOrdinal("BulkRequestId")),
        RequestReference  = r.GetString(r.GetOrdinal("RequestReference")),
        CustomerId        = r.GetInt32(r.GetOrdinal("CustomerId")),
        ProviderId        = r.GetInt32(r.GetOrdinal("ProviderId")),
        ServiceId         = r.GetInt32(r.GetOrdinal("ServiceId")),
        FulfillmentMethod = r.GetString(r.GetOrdinal("FulfillmentMethod")),
        Address           = NullStr(r, "Address"),
        PreferredDate     = NullDt(r, "PreferredDate"),
        PreferredSlot     = NullStr(r, "PreferredSlot"),
        Notes             = NullStr(r, "Notes"),
        Status            = r.GetString(r.GetOrdinal("Status")),
        PricePerKg        = r.GetDecimal(r.GetOrdinal("PricePerKg")),
        ActualWeightKg    = NullDec(r, "ActualWeightKg"),
        FinalPrice        = NullDec(r, "FinalPrice"),
        PaymentProvider   = NullStr(r, "PaymentProvider"),
        PaymentStatus     = NullStr(r, "PaymentStatus"),
        CreatedAt         = NullDt(r, "CreatedAt"),
        AcceptedAt        = NullDt(r, "AcceptedAt"),
        ReceivedAt        = NullDt(r, "ReceivedAt"),
        WeighedAt         = NullDt(r, "WeighedAt"),
        ConfirmedAt       = NullDt(r, "ConfirmedAt"),
        PaidAt            = NullDt(r, "PaidAt"),
        ProcessingAt      = NullDt(r, "ProcessingAt"),
        ReadyAt           = NullDt(r, "ReadyAt"),
        CompletedAt       = NullDt(r, "CompletedAt"),
        CancelledAt       = NullDt(r, "CancelledAt"),
        ServiceName       = NullStr(r, "ServiceName"),
        ServiceDescription= NullStr(r, "ServiceDescription"),
        ProviderName      = NullStr(r, "ProviderName"),
        CustomerName      = NullStr(r, "CustomerName"),
        CustomerPhone     = NullStr(r, "CustomerPhone"),
    };

    private static string? NullStr(SqlDataReader r, string col)
    {
        var o = r.GetOrdinal(col);
        return r.IsDBNull(o) ? null : r.GetString(o);
    }

    private static DateTime? NullDt(SqlDataReader r, string col)
    {
        var o = r.GetOrdinal(col);
        return r.IsDBNull(o) ? null : r.GetDateTime(o);
    }

    private static decimal? NullDec(SqlDataReader r, string col)
    {
        var o = r.GetOrdinal(col);
        return r.IsDBNull(o) ? null : r.GetDecimal(o);
    }
}
