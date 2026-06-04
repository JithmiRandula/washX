-- Service item CRUD procedures (run on LaundryAggregatorDb)

IF OBJECT_ID('SP_UpdateServiceItem', 'P') IS NOT NULL DROP PROCEDURE SP_UpdateServiceItem;
GO
CREATE PROCEDURE SP_UpdateServiceItem
    @ItemId INT,
    @ServiceTypeId INT,
    @ItemName NVARCHAR(100),
    @Description NVARCHAR(250),
    @Price DECIMAL(10,2),
    @ImageUrl NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ServiceItems
    SET ItemName = @ItemName,
        Description = @Description,
        Price = @Price,
        ImageUrl = @ImageUrl
    WHERE ItemId = @ItemId AND ServiceTypeId = @ServiceTypeId;
END
GO

IF OBJECT_ID('SP_DeleteServiceItem', 'P') IS NOT NULL DROP PROCEDURE SP_DeleteServiceItem;
GO
CREATE PROCEDURE SP_DeleteServiceItem
    @ItemId INT,
    @ServiceTypeId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM ServiceItems
    WHERE ItemId = @ItemId AND ServiceTypeId = @ServiceTypeId;
END
GO
