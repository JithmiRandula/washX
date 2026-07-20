using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class NotificationRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    // Called for each provider when a customer places an order.
    public Task AddOrderNotification(
        int providerId, int orderId,
        string orderReference, string? customerName, decimal totalAmount)
    {
        SqlParameter[] p =
        [
            new("@ProviderId",     providerId),
            new("@OrderId",        orderId),
            new("@OrderReference", orderReference),
            new("@CustomerName",   (object?)customerName ?? DBNull.Value),
            new("@Title",          "New Order Received"),
            new("@Message",        $"You received a new order {orderReference} worth Rs {totalAmount:0.00}.")
        ];

        const string sqlText = """
            INSERT INTO dbo.Notifications
                (ProviderId, OrderId, OrderReference, CustomerName, RecipientRole, Title, Message, IsRead, CreatedAt)
            VALUES
                (@ProviderId, @OrderId, @OrderReference, @CustomerName, 'provider', @Title, @Message, 0, GETDATE())
            """;

        return _sql.ExecuteNonQueryAsync(sqlText, p, CommandType.Text);
    }

    // Called for the customer when the provider marks their order complete.
    public Task AddCustomerNotification(
        int customerId, int providerId, int orderId, string orderReference, string title, string message)
    {
        SqlParameter[] p =
        [
            new("@CustomerId",     customerId),
            new("@ProviderId",     providerId),
            new("@OrderId",        orderId),
            new("@OrderReference", orderReference),
            new("@Title",          title),
            new("@Message",        message)
        ];

        // ProviderName is embedded via subquery so callers don't need a separate lookup.
        const string sqlText = """
            INSERT INTO dbo.Notifications
                (ProviderId, CustomerId, OrderId, OrderReference, ProviderName, RecipientRole, Title, Message, IsRead, CreatedAt)
            SELECT @ProviderId, @CustomerId, @OrderId, @OrderReference, p.BusinessName, 'customer', @Title, @Message, 0, GETDATE()
            FROM dbo.Providers p
            WHERE p.ProviderId = @ProviderId
            """;

        return _sql.ExecuteNonQueryAsync(sqlText, p, CommandType.Text);
    }

    // Latest 50 notifications for a provider
    public Task<List<Notification>> GetByProvider(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        const string sqlText = """
            SELECT TOP 50 *
            FROM dbo.Notifications
            WHERE RecipientRole = 'provider' AND ProviderId = @ProviderId
            ORDER BY CreatedAt DESC
            """;
        return _sql.ExecuteListAsync(sqlText, p, Map, CommandType.Text);
    }

    // Latest 50 notifications for a customer
    public Task<List<Notification>> GetByCustomer(int customerId)
    {
        SqlParameter[] p = [new("@CustomerId", customerId)];
        const string sqlText = """
            SELECT TOP 50 *
            FROM dbo.Notifications
            WHERE RecipientRole = 'customer' AND CustomerId = @CustomerId
            ORDER BY CreatedAt DESC
            """;
        return _sql.ExecuteListAsync(sqlText, p, Map, CommandType.Text);
    }

    public async Task<int> GetUnreadCountForProvider(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        return await _sql.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.Notifications WHERE RecipientRole = 'provider' AND ProviderId = @ProviderId AND IsRead = 0",
            p, CommandType.Text);
    }

    public async Task<int> GetUnreadCountForCustomer(int customerId)
    {
        SqlParameter[] p = [new("@CustomerId", customerId)];
        return await _sql.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.Notifications WHERE RecipientRole = 'customer' AND CustomerId = @CustomerId AND IsRead = 0",
            p, CommandType.Text);
    }

    // Mark one notification as read (role-scoped so a user can't touch another user's row)
    public Task MarkRead(int notificationId, string role, int id)
    {
        SqlParameter[] p = [new("@NotificationId", notificationId), new("@Role", role), new("@Id", id)];
        const string sqlText = """
            UPDATE dbo.Notifications SET IsRead = 1
            WHERE NotificationId = @NotificationId AND RecipientRole = @Role
              AND ((@Role = 'provider' AND ProviderId = @Id) OR (@Role = 'customer' AND CustomerId = @Id))
            """;
        return _sql.ExecuteNonQueryAsync(sqlText, p, CommandType.Text);
    }

    public Task MarkAllRead(string role, int id)
    {
        SqlParameter[] p = [new("@Role", role), new("@Id", id)];
        const string sqlText = """
            UPDATE dbo.Notifications SET IsRead = 1
            WHERE RecipientRole = @Role
              AND ((@Role = 'provider' AND ProviderId = @Id) OR (@Role = 'customer' AND CustomerId = @Id))
            """;
        return _sql.ExecuteNonQueryAsync(sqlText, p, CommandType.Text);
    }

    public Task Delete(int notificationId, string role, int id)
    {
        SqlParameter[] p = [new("@NotificationId", notificationId), new("@Role", role), new("@Id", id)];
        const string sqlText = """
            DELETE FROM dbo.Notifications
            WHERE NotificationId = @NotificationId AND RecipientRole = @Role
              AND ((@Role = 'provider' AND ProviderId = @Id) OR (@Role = 'customer' AND CustomerId = @Id))
            """;
        return _sql.ExecuteNonQueryAsync(sqlText, p, CommandType.Text);
    }

    private static Notification Map(SqlDataReader r) => new()
    {
        NotificationId = r.GetInt32(r.GetOrdinal("NotificationId")),
        ProviderId     = r.GetInt32(r.GetOrdinal("ProviderId")),
        CustomerId     = r.IsDBNull(r.GetOrdinal("CustomerId"))     ? null : r.GetInt32(r.GetOrdinal("CustomerId")),
        RecipientRole  = r.GetString(r.GetOrdinal("RecipientRole")),
        OrderId        = r.IsDBNull(r.GetOrdinal("OrderId"))        ? null : r.GetInt32(r.GetOrdinal("OrderId")),
        OrderReference = r.IsDBNull(r.GetOrdinal("OrderReference")) ? null : r.GetString(r.GetOrdinal("OrderReference")),
        CustomerName   = r.IsDBNull(r.GetOrdinal("CustomerName"))   ? null : r.GetString(r.GetOrdinal("CustomerName")),
        ProviderName   = r.IsDBNull(r.GetOrdinal("ProviderName"))   ? null : r.GetString(r.GetOrdinal("ProviderName")),
        Title          = r.GetString(r.GetOrdinal("Title")),
        Message        = r.GetString(r.GetOrdinal("Message")),
        IsRead         = r.GetBoolean(r.GetOrdinal("IsRead")),
        CreatedAt      = r.GetDateTime(r.GetOrdinal("CreatedAt")),
    };
}
