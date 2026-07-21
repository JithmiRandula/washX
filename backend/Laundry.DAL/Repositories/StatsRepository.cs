using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class StatsRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    public async Task<PlatformStats> GetPlatformStats()
    {
        var providerCount = await _sql.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.Providers", [], CommandType.Text);

        var customerCount = await _sql.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.Customers", [], CommandType.Text);

        var rating = await _sql.ExecuteSingleAsync(
            """
            SELECT COUNT(*) AS TotalReviews, ISNULL(AVG(CAST(Rating AS FLOAT)), 0) AS AverageRating
            FROM dbo.Reviews
            """,
            [],
            r => new PlatformStats
            {
                TotalReviews  = r.GetInt32(r.GetOrdinal("TotalReviews")),
                AverageRating = r.GetDouble(r.GetOrdinal("AverageRating"))
            },
            CommandType.Text);

        return new PlatformStats
        {
            TotalProviders = providerCount,
            TotalCustomers = customerCount,
            TotalReviews   = rating?.TotalReviews ?? 0,
            AverageRating  = rating?.AverageRating ?? 0
        };
    }
}
