-- Cart join uses ServiceItems.ServiceId (not ServiceTypeId)
USE [LaundryAggregatorDb];
GO

CREATE OR ALTER PROCEDURE dbo.SP_GetCartItems
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.CartItemId,
        c.CustomerId,
        c.ProviderId,
        c.ItemId,
        c.Quantity,
        c.AddedAt,
        si.ServiceId,
        si.ItemName,
        si.Description,
        si.Price,
        si.ImageUrl,
        p.BusinessName AS ProviderName
    FROM CartItems c
    INNER JOIN ServiceItems si ON si.ItemId = c.ItemId
    LEFT JOIN Providers p ON p.ProviderId = c.ProviderId
    WHERE c.CustomerId = @CustomerId
    ORDER BY c.AddedAt DESC;
END
GO
