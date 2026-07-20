using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class ProviderRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    private sealed class ProviderServiceRow
    {
        public int ProviderId { get; init; }
        public int UserId { get; init; }
        public string BusinessName { get; init; } = string.Empty;
        public string? BusinessAddress { get; init; }
        public decimal? Latitude { get; init; }
        public decimal? Longitude { get; init; }
        public string? ProviderDescription { get; init; }
        public decimal Rating { get; init; }
        public bool IsVerified { get; init; }
        public bool OffersDelivery { get; init; }
        public decimal DeliveryFee { get; init; }
        public DateTime ProviderCreatedAt { get; init; }

        public int? ServiceId { get; init; }
        public string? ServiceName { get; init; }
        public string? Category { get; init; }
        public string? PricingType { get; init; }
        public decimal? Price { get; init; }
        public int? MinimumOrder { get; init; }
        public string? TurnaroundTime { get; init; }
        public string? ServiceDescription { get; init; }
        public string? KeyFeatures { get; init; }
        public string? SpecialInstructions { get; init; }
        public DateTime? ServiceCreatedAt { get; init; }
    }

    public async Task<ProviderProfile?> GetProviderProfile(int providerId)
    {
        SqlParameter[] parameters =
        [
            new("@ProviderId", providerId)
        ];

        var profile = await _sql.ExecuteSingleAsync(
            "sp_GetProviderProfile",
            parameters,
            map: reader => new ProviderProfile
            {
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Phone = reader.GetString(reader.GetOrdinal("Phone")),
                BusinessName = reader.GetString(reader.GetOrdinal("BusinessName")),
                BusinessAddress = reader.IsDBNull(reader.GetOrdinal("BusinessAddress"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("BusinessAddress")),
                Latitude = reader.IsDBNull(reader.GetOrdinal("Latitude"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Latitude")),
                Longitude = reader.IsDBNull(reader.GetOrdinal("Longitude"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Longitude")),
                Description = reader.IsDBNull(reader.GetOrdinal("Description"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("Description")),
                Rating = reader.GetDecimal(reader.GetOrdinal("Rating")),
                IsVerified = reader.GetBoolean(reader.GetOrdinal("IsVerified")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            },
            commandType: CommandType.StoredProcedure);

        // sp_GetProviderProfile predates the delivery columns — merge them in separately
        // rather than touching the (un-source-controlled) stored procedure.
        if (profile is not null)
        {
            var (offersDelivery, deliveryFee) = await GetDeliverySettings(providerId);
            profile.OffersDelivery = offersDelivery;
            profile.DeliveryFee = deliveryFee;
        }

        return profile;
    }

    public async Task<(bool OffersDelivery, decimal DeliveryFee)> GetDeliverySettings(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        var row = await _sql.ExecuteSingleAsync(
            "SELECT OffersDelivery, DeliveryFee FROM dbo.Providers WHERE ProviderId = @ProviderId",
            p,
            reader => (
                reader.GetBoolean(reader.GetOrdinal("OffersDelivery")),
                reader.GetDecimal(reader.GetOrdinal("DeliveryFee"))
            ));
        return row;
    }

    public Task UpdateDeliverySettings(int providerId, bool offersDelivery, decimal deliveryFee)
    {
        SqlParameter[] p =
        [
            new("@ProviderId", providerId),
            new("@OffersDelivery", offersDelivery),
            new("@DeliveryFee", deliveryFee)
        ];
        return _sql.ExecuteNonQueryAsync(
            "UPDATE dbo.Providers SET OffersDelivery = @OffersDelivery, DeliveryFee = @DeliveryFee WHERE ProviderId = @ProviderId",
            p);
    }

    private const string ProvidersWithServicesSql = """
        SELECT
            p.ProviderId,
            p.UserId,
            p.BusinessName,
            p.BusinessAddress,
            p.Latitude,
            p.Longitude,
            p.Description AS ProviderDescription,
            p.Rating,
            p.IsVerified,
            p.OffersDelivery,
            p.DeliveryFee,
            p.CreatedAt AS ProviderCreatedAt,
            s.ServiceId,
            s.ServiceName,
            s.Category,
            s.PricingType,
            s.BasePrice AS Price,
            s.MinimumOrder,
            s.TurnaroundTime,
            s.Description AS ServiceDescription,
            s.KeyFeatures,
            s.SpecialInstructions,
            s.CreatedAt AS ServiceCreatedAt
        FROM Providers p
        LEFT JOIN Services s ON p.ProviderId = s.ProviderId
            AND (s.IsActive = 1 OR s.IsActive IS NULL)
        ORDER BY p.ProviderId, s.ServiceId DESC
        """;

    public async Task<List<ProviderWithServices>> GetProvidersWithServices()
    {
        var rows = await _sql.ExecuteListAsync(
            commandText: ProvidersWithServicesSql,
            parameters: null,
            map: reader => new ProviderServiceRow
            {
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                BusinessName = reader.GetString(reader.GetOrdinal("BusinessName")),
                BusinessAddress = reader.IsDBNull(reader.GetOrdinal("BusinessAddress"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("BusinessAddress")),
                Latitude = reader.IsDBNull(reader.GetOrdinal("Latitude"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Latitude")),
                Longitude = reader.IsDBNull(reader.GetOrdinal("Longitude"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Longitude")),
                ProviderDescription = reader.IsDBNull(reader.GetOrdinal("ProviderDescription"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ProviderDescription")),
                Rating = reader.GetDecimal(reader.GetOrdinal("Rating")),
                IsVerified = reader.GetBoolean(reader.GetOrdinal("IsVerified")),
                OffersDelivery = reader.GetBoolean(reader.GetOrdinal("OffersDelivery")),
                DeliveryFee = reader.GetDecimal(reader.GetOrdinal("DeliveryFee")),
                ProviderCreatedAt = reader.GetDateTime(reader.GetOrdinal("ProviderCreatedAt")),

                ServiceId = reader.IsDBNull(reader.GetOrdinal("ServiceId"))
                    ? null
                    : reader.GetInt32(reader.GetOrdinal("ServiceId")),
                ServiceName = reader.IsDBNull(reader.GetOrdinal("ServiceName"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ServiceName")),
                Category = reader.IsDBNull(reader.GetOrdinal("Category"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("Category")),
                PricingType = reader.IsDBNull(reader.GetOrdinal("PricingType"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("PricingType")),
                Price = ReadProviderServicePrice(reader),
                MinimumOrder = reader.IsDBNull(reader.GetOrdinal("MinimumOrder"))
                    ? null
                    : reader.GetInt32(reader.GetOrdinal("MinimumOrder")),
                TurnaroundTime = reader.IsDBNull(reader.GetOrdinal("TurnaroundTime"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("TurnaroundTime")),
                ServiceDescription = reader.IsDBNull(reader.GetOrdinal("ServiceDescription"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ServiceDescription")),
                KeyFeatures = reader.IsDBNull(reader.GetOrdinal("KeyFeatures"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("KeyFeatures")),
                SpecialInstructions = reader.IsDBNull(reader.GetOrdinal("SpecialInstructions"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("SpecialInstructions")),
                ServiceCreatedAt = reader.IsDBNull(reader.GetOrdinal("ServiceCreatedAt"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("ServiceCreatedAt"))
            },
            commandType: CommandType.Text);

        var byProvider = new Dictionary<int, ProviderWithServices>();

        foreach (var row in rows)
        {
            if (!byProvider.TryGetValue(row.ProviderId, out var provider))
            {
                provider = new ProviderWithServices
                {
                    ProviderId = row.ProviderId,
                    UserId = row.UserId,
                    BusinessName = row.BusinessName,
                    BusinessAddress = row.BusinessAddress,
                    Latitude = row.Latitude,
                    Longitude = row.Longitude,
                    Description = row.ProviderDescription,
                    Rating = row.Rating,
                    IsVerified = row.IsVerified,
                    OffersDelivery = row.OffersDelivery,
                    DeliveryFee = row.DeliveryFee,
                    ProviderCreatedAt = row.ProviderCreatedAt,
                    Services = new List<Service>()
                };

                byProvider.Add(row.ProviderId, provider);
            }

            if (row.ServiceId.HasValue && row.ServiceId.Value > 0)
            {
                provider.Services.Add(new Service
                {
                    ServiceId = row.ServiceId.Value,
                    ProviderId = row.ProviderId,
                    ProviderBusinessName = row.BusinessName,
                    ServiceName = row.ServiceName ?? string.Empty,
                    Category = row.Category ?? string.Empty,
                    PricingType = row.PricingType ?? string.Empty,
                    Price = row.Price ?? 0m,
                    MinimumOrder = row.MinimumOrder ?? 0,
                    TurnaroundTime = row.TurnaroundTime,
                    Description = row.ServiceDescription,
                    KeyFeatures = row.KeyFeatures,
                    SpecialInstructions = row.SpecialInstructions
                });
            }
        }

        return byProvider.Values.ToList();
    }

    private static decimal? ReadProviderServicePrice(SqlDataReader reader)
    {
        try
        {
            var ordinal = reader.GetOrdinal("Price");
            return reader.IsDBNull(ordinal) ? null : reader.GetDecimal(ordinal);
        }
        catch (IndexOutOfRangeException)
        {
            try
            {
                var ordinal = reader.GetOrdinal("BasePrice");
                return reader.IsDBNull(ordinal) ? null : reader.GetDecimal(ordinal);
            }
            catch (IndexOutOfRangeException)
            {
                return null;
            }
        }
    }

    public async Task<ProviderWithServices?> GetProviderWithServices(int providerId)
    {
        SqlParameter[] parameters =
        [
            new("@ProviderId", providerId)
        ];

        var rows = await _sql.ExecuteListAsync(
            commandText: @"SELECT 
    p.ProviderId,
    p.UserId,
    p.BusinessName,
    p.BusinessAddress,
    p.Latitude,
    p.Longitude,
    p.Description AS ProviderDescription,
    p.Rating,
    p.IsVerified,
    p.OffersDelivery,
    p.DeliveryFee,
    p.CreatedAt AS ProviderCreatedAt,

    s.ServiceId,
    s.ServiceName,
    s.Category,
    s.PricingType,
    s.BasePrice AS Price,
    s.MinimumOrder,
    s.TurnaroundTime,
    s.Description AS ServiceDescription,
    s.KeyFeatures,
    s.SpecialInstructions,
    s.CreatedAt AS ServiceCreatedAt
FROM Providers p
INNER JOIN Services s ON p.ProviderId = s.ProviderId AND s.IsActive = 1
WHERE p.ProviderId = @ProviderId
ORDER BY s.ServiceId DESC",
            parameters: parameters,
            map: reader => new ProviderServiceRow
            {
                ProviderId = reader.GetInt32(reader.GetOrdinal("ProviderId")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                BusinessName = reader.GetString(reader.GetOrdinal("BusinessName")),
                BusinessAddress = reader.IsDBNull(reader.GetOrdinal("BusinessAddress"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("BusinessAddress")),
                Latitude = reader.IsDBNull(reader.GetOrdinal("Latitude"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Latitude")),
                Longitude = reader.IsDBNull(reader.GetOrdinal("Longitude"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Longitude")),
                ProviderDescription = reader.IsDBNull(reader.GetOrdinal("ProviderDescription"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ProviderDescription")),
                Rating = reader.GetDecimal(reader.GetOrdinal("Rating")),
                IsVerified = reader.GetBoolean(reader.GetOrdinal("IsVerified")),
                OffersDelivery = reader.GetBoolean(reader.GetOrdinal("OffersDelivery")),
                DeliveryFee = reader.GetDecimal(reader.GetOrdinal("DeliveryFee")),
                ProviderCreatedAt = reader.GetDateTime(reader.GetOrdinal("ProviderCreatedAt")),

                ServiceId = reader.IsDBNull(reader.GetOrdinal("ServiceId"))
                    ? null
                    : reader.GetInt32(reader.GetOrdinal("ServiceId")),
                ServiceName = reader.IsDBNull(reader.GetOrdinal("ServiceName"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ServiceName")),
                Category = reader.IsDBNull(reader.GetOrdinal("Category"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("Category")),
                PricingType = reader.IsDBNull(reader.GetOrdinal("PricingType"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("PricingType")),
                Price = ReadProviderServicePrice(reader),
                MinimumOrder = reader.IsDBNull(reader.GetOrdinal("MinimumOrder"))
                    ? null
                    : reader.GetInt32(reader.GetOrdinal("MinimumOrder")),
                TurnaroundTime = reader.IsDBNull(reader.GetOrdinal("TurnaroundTime"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("TurnaroundTime")),
                ServiceDescription = reader.IsDBNull(reader.GetOrdinal("ServiceDescription"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ServiceDescription")),
                KeyFeatures = reader.IsDBNull(reader.GetOrdinal("KeyFeatures"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("KeyFeatures")),
                SpecialInstructions = reader.IsDBNull(reader.GetOrdinal("SpecialInstructions"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("SpecialInstructions")),
                ServiceCreatedAt = reader.IsDBNull(reader.GetOrdinal("ServiceCreatedAt"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("ServiceCreatedAt"))
            },
            commandType: CommandType.Text);

        if (rows.Count == 0)
        {
            return null;
        }

        var first = rows[0];
        var provider = new ProviderWithServices
        {
            ProviderId = first.ProviderId,
            UserId = first.UserId,
            BusinessName = first.BusinessName,
            BusinessAddress = first.BusinessAddress,
            Latitude = first.Latitude,
            Longitude = first.Longitude,
            Description = first.ProviderDescription,
            Rating = first.Rating,
            IsVerified = first.IsVerified,
            OffersDelivery = first.OffersDelivery,
            DeliveryFee = first.DeliveryFee,
            ProviderCreatedAt = first.ProviderCreatedAt,
            Services = new List<Service>()
        };

        foreach (var row in rows)
        {
            if (row.ServiceId.HasValue && row.ServiceId.Value > 0)
            {
                provider.Services.Add(new Service
                {
                    ServiceId = row.ServiceId.Value,
                    ProviderId = row.ProviderId,
                    ProviderBusinessName = row.BusinessName,
                    ServiceName = row.ServiceName ?? string.Empty,
                    Category = row.Category ?? string.Empty,
                    PricingType = row.PricingType ?? string.Empty,
                    Price = row.Price ?? 0m,
                    MinimumOrder = row.MinimumOrder ?? 0,
                    TurnaroundTime = row.TurnaroundTime,
                    Description = row.ServiceDescription,
                    KeyFeatures = row.KeyFeatures,
                    SpecialInstructions = row.SpecialInstructions
                });
            }
        }

        return provider;
    }
}
