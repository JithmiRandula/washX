using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class NotificationRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    // Called for each provider when an order is placed.
    // Passes all values directly — no JOINs in the SP, so nothing can silently fail.
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
            new("@TotalAmount",    totalAmount)
        ];
        return _sql.ExecuteNonQueryAsync("SP_AddNotification", p, CommandType.StoredProcedure);
    }

    // Get latest 50 notifications for a provider
    public Task<List<Notification>> GetByProvider(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        return _sql.ExecuteListAsync(
            "SP_GetNotificationsByProvider", p, Map, CommandType.StoredProcedure);
    }

    // Unread count for the bell badge
    public async Task<int> GetUnreadCount(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        return await _sql.ExecuteScalarAsync<int>(
            "SP_GetUnreadNotificationCount", p, CommandType.StoredProcedure);
    }

    // Mark one notification as read
    public Task MarkRead(int notificationId, int providerId)
    {
        SqlParameter[] p =
        [
            new("@NotificationId", notificationId),
            new("@ProviderId",     providerId)
        ];
        return _sql.ExecuteNonQueryAsync(
            "SP_MarkNotificationRead", p, CommandType.StoredProcedure);
    }

    // Mark all as read
    public Task MarkAllRead(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        return _sql.ExecuteNonQueryAsync(
            "SP_MarkAllNotificationsRead", p, CommandType.StoredProcedure);
    }

    // Delete one
    public Task Delete(int notificationId, int providerId)
    {
        SqlParameter[] p =
        [
            new("@NotificationId", notificationId),
            new("@ProviderId",     providerId)
        ];
        return _sql.ExecuteNonQueryAsync(
            "SP_DeleteNotification", p, CommandType.StoredProcedure);
    }

    private static Notification Map(SqlDataReader r) => new()
    {
        NotificationId = r.GetInt32(r.GetOrdinal("NotificationId")),
        ProviderId     = r.GetInt32(r.GetOrdinal("ProviderId")),
        OrderId        = r.IsDBNull(r.GetOrdinal("OrderId"))        ? null : r.GetInt32(r.GetOrdinal("OrderId")),
        OrderReference = r.IsDBNull(r.GetOrdinal("OrderReference")) ? null : r.GetString(r.GetOrdinal("OrderReference")),
        CustomerName   = r.IsDBNull(r.GetOrdinal("CustomerName"))   ? null : r.GetString(r.GetOrdinal("CustomerName")),
        Title          = r.GetString(r.GetOrdinal("Title")),
        Message        = r.GetString(r.GetOrdinal("Message")),
        IsRead         = r.GetBoolean(r.GetOrdinal("IsRead")),
        CreatedAt      = r.GetDateTime(r.GetOrdinal("CreatedAt")),
    };
}
