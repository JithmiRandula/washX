using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class AdminRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public async Task<AdminStats> GetDashboardStats()
    {
        var result = await _sql.ExecuteSingleAsync(
            "SP_GetAdminDashboardStats", [], MapStats, CommandType.StoredProcedure);
        return result ?? new AdminStats();
    }

    public Task<List<AdminUser>> GetAllUsers() =>
        _sql.ExecuteListAsync("SP_GetAllUsersAdmin", [], MapUser, CommandType.StoredProcedure);

    public Task<List<AdminOrder>> GetAllOrders() =>
        _sql.ExecuteListAsync("SP_GetAllOrdersAdmin", [], MapOrder, CommandType.StoredProcedure);

    public Task<List<AdminProvider>> GetAllProviders() =>
        _sql.ExecuteListAsync("SP_GetAllProvidersAdmin", [], MapProvider, CommandType.StoredProcedure);

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static AdminStats MapStats(SqlDataReader r) => new()
    {
        TotalUsers      = r.GetInt32(r.GetOrdinal("TotalUsers")),
        TotalCustomers  = r.GetInt32(r.GetOrdinal("TotalCustomers")),
        TotalProviders  = r.GetInt32(r.GetOrdinal("TotalProviders")),
        TotalOrders     = r.GetInt32(r.GetOrdinal("TotalOrders")),
        PendingOrders   = r.GetInt32(r.GetOrdinal("PendingOrders")),
        ActiveOrders    = r.GetInt32(r.GetOrdinal("ActiveOrders")),
        CompletedOrders = r.GetInt32(r.GetOrdinal("CompletedOrders")),
        CancelledOrders = r.GetInt32(r.GetOrdinal("CancelledOrders")),
        TotalRevenue    = r.GetDecimal(r.GetOrdinal("TotalRevenue")),
        MonthlyRevenue  = r.GetDecimal(r.GetOrdinal("MonthlyRevenue")),
        TotalReviews    = r.GetInt32(r.GetOrdinal("TotalReviews"))
    };

    private static AdminUser MapUser(SqlDataReader r) => new()
    {
        UserId      = r.GetInt32(r.GetOrdinal("UserId")),
        Name        = r.GetString(r.GetOrdinal("Name")),
        Email       = r.GetString(r.GetOrdinal("Email")),
        Phone       = NullStr(r, "Phone") ?? "",
        Role        = r.GetString(r.GetOrdinal("Role")),
        CreatedAt   = NullDt(r, "CreatedAt"),
        TotalOrders = r.GetInt32(r.GetOrdinal("TotalOrders")),
        TotalSpent  = r.GetDecimal(r.GetOrdinal("TotalSpent")),
        Address     = NullStr(r, "Address")
    };

    private static AdminOrder MapOrder(SqlDataReader r) => new()
    {
        OrderId        = r.GetInt32(r.GetOrdinal("OrderId")),
        OrderReference = r.GetString(r.GetOrdinal("OrderReference")),
        TotalAmount    = r.GetDecimal(r.GetOrdinal("TotalAmount")),
        PaymentStatus  = NullStr(r, "PaymentStatus") ?? "Pending",
        Status         = NullStr(r, "Status") ?? "pending",
        CreatedAt      = NullDt(r, "CreatedAt"),
        CustomerName   = r.GetString(r.GetOrdinal("CustomerName")),
        CustomerEmail  = r.GetString(r.GetOrdinal("CustomerEmail")),
        CustomerPhone  = NullStr(r, "CustomerPhone"),
        ProviderName   = NullStr(r, "ProviderName")
    };

    private static AdminProvider MapProvider(SqlDataReader r) => new()
    {
        ProviderId      = r.GetInt32(r.GetOrdinal("ProviderId")),
        BusinessName    = r.GetString(r.GetOrdinal("BusinessName")),
        BusinessAddress = NullStr(r, "BusinessAddress"),
        IsVerified      = r.GetBoolean(r.GetOrdinal("IsVerified")),
        JoinedAt        = NullDt(r, "JoinedAt"),
        OwnerName       = r.GetString(r.GetOrdinal("OwnerName")),
        Email           = r.GetString(r.GetOrdinal("Email")),
        Phone           = NullStr(r, "Phone"),
        TotalOrders     = r.GetInt32(r.GetOrdinal("TotalOrders")),
        AverageRating   = r.GetDouble(r.GetOrdinal("AverageRating")),
        TotalReviews    = r.GetInt32(r.GetOrdinal("TotalReviews")),
        Revenue         = r.GetDecimal(r.GetOrdinal("Revenue"))
    };

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
