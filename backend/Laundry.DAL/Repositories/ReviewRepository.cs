using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class ReviewRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public Task<int> AddReview(Review review)
    {
        SqlParameter[] p =
        [
            new("@OrderId",    review.OrderId),
            new("@CustomerId", review.CustomerId),
            new("@ProviderId", review.ProviderId),
            new("@Rating",     (byte)review.Rating),
            new("@Comment",    (object?)review.Comment ?? DBNull.Value)
        ];
        return _sql.ExecuteScalarAsync<int>("SP_AddReview", p, CommandType.StoredProcedure);
    }

    public Task<List<Review>> GetReviewsByProvider(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        return _sql.ExecuteListAsync("SP_GetProviderReviews", p, MapReview, CommandType.StoredProcedure);
    }

    public async Task<RatingSummary> GetRatingSummary(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        var result = await _sql.ExecuteSingleAsync(
            "SP_GetProviderRatingSummary", p, MapRatingSummary, CommandType.StoredProcedure);
        return result ?? new RatingSummary();
    }

    public async Task<bool> CanCustomerReview(int orderId, int customerId, int providerId)
    {
        SqlParameter[] p =
        [
            new("@OrderId",    orderId),
            new("@CustomerId", customerId),
            new("@ProviderId", providerId)
        ];
        var result = await _sql.ExecuteScalarAsync<int>("SP_CanCustomerReview", p, CommandType.StoredProcedure);
        return result == 1;
    }

    public Task<List<ReviewableOrder>> GetReviewableOrders(int customerId)
    {
        SqlParameter[] p = [new("@CustomerId", customerId)];
        return _sql.ExecuteListAsync(
            "SP_GetCustomerReviewableOrders", p, MapReviewableOrder, CommandType.StoredProcedure);
    }

    public Task<List<ProviderRating>> GetAllProviderRatings()
    {
        return _sql.ExecuteListAsync(
            "SP_GetAllProviderRatings", [], MapProviderRating, CommandType.StoredProcedure);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static Review MapReview(SqlDataReader r) => new()
    {
        ReviewId       = r.GetInt32(r.GetOrdinal("ReviewId")),
        OrderId        = r.GetInt32(r.GetOrdinal("OrderId")),
        CustomerId     = r.GetInt32(r.GetOrdinal("CustomerId")),
        ProviderId     = r.GetInt32(r.GetOrdinal("ProviderId")),
        Rating         = r.GetByte(r.GetOrdinal("Rating")),
        Comment        = NullStr(r, "Comment"),
        CreatedAt      = NullDt(r, "CreatedAt"),
        CustomerName   = NullStr(r, "CustomerName"),
        OrderReference = NullStr(r, "OrderReference")
    };

    private static ProviderRating MapProviderRating(SqlDataReader r) => new()
    {
        ProviderId    = r.GetInt32(r.GetOrdinal("ProviderId")),
        AverageRating = r.GetDouble(r.GetOrdinal("AverageRating")),
        TotalReviews  = r.GetInt32(r.GetOrdinal("TotalReviews"))
    };

    private static RatingSummary MapRatingSummary(SqlDataReader r) => new()
    {
        AverageRating = r.GetDouble(r.GetOrdinal("AverageRating")),
        TotalReviews  = r.GetInt32(r.GetOrdinal("TotalReviews")),
        Star5         = r.GetInt32(r.GetOrdinal("Star5")),
        Star4         = r.GetInt32(r.GetOrdinal("Star4")),
        Star3         = r.GetInt32(r.GetOrdinal("Star3")),
        Star2         = r.GetInt32(r.GetOrdinal("Star2")),
        Star1         = r.GetInt32(r.GetOrdinal("Star1"))
    };

    private static ReviewableOrder MapReviewableOrder(SqlDataReader r) => new()
    {
        OrderId        = r.GetInt32(r.GetOrdinal("OrderId")),
        OrderReference = r.GetString(r.GetOrdinal("OrderReference")),
        OrderDate      = NullDt(r, "CreatedAt"),
        ProviderId     = r.GetInt32(r.GetOrdinal("ProviderId")),
        ProviderName   = r.GetString(r.GetOrdinal("ProviderName"))
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
