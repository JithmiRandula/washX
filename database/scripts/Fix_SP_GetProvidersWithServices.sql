-- Optional: fix SP if you still call sp_GetProvidersWithServices elsewhere
USE [LaundryAggregatorDb];
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetProvidersWithServices
AS
BEGIN
    SET NOCOUNT ON;
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
    LEFT JOIN Services s ON p.ProviderId = s.ProviderId AND s.IsActive = 1
    ORDER BY p.ProviderId, s.ServiceId DESC;
END
GO
