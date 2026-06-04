-- Fix SP_AddToCart IF/ELSE block (run on LaundryAggregatorDb)
USE [LaundryAggregatorDb];
GO

ALTER PROCEDURE [dbo].[SP_AddToCart]
(
    @CustomerId INT,
    @ProviderId INT,
    @ItemId INT
)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM CartItems
        WHERE CustomerId = @CustomerId
          AND ItemId = @ItemId
    )
    BEGIN
        UPDATE CartItems
        SET Quantity = Quantity + 1,
            ProviderId = @ProviderId
        WHERE CustomerId = @CustomerId
          AND ItemId = @ItemId;
    END
    ELSE
    BEGIN
        INSERT INTO CartItems (CustomerId, ProviderId, ItemId, Quantity)
        VALUES (@CustomerId, @ProviderId, @ItemId, 1);
    END
END
GO
