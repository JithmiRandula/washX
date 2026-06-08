-- ============================================================
-- WashX — ServiceItems Stored Procedures
-- Database: LaundryAggregatorDb
-- Table:    ServiceItems (ItemId, ServiceId, ItemName, Description, Price, ImageUrl, IsAvailable)
-- Run in SSMS or: sqlcmd -S "YOUR_SERVER" -d LaundryAggregatorDb -E -i ServiceItem_SPs.sql
-- ============================================================

USE [LaundryAggregatorDb];
GO

-- ------------------------------------------------------------
-- 1. sp_AddServiceItem
--    Params: @ServiceId, @ItemName, @Description, @Price, @ImageUrl
--    Returns: new ItemId
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_AddServiceItem
    @ServiceId   INT,
    @ItemName    NVARCHAR(150),
    @Description NVARCHAR(300) = NULL,
    @Price       DECIMAL(10,2),
    @ImageUrl    NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.ServiceItems
        (ServiceId, ItemName, Description, Price, ImageUrl, IsAvailable)
    VALUES
        (@ServiceId, @ItemName, @Description, @Price, @ImageUrl, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS ItemId;
END
GO

-- ------------------------------------------------------------
-- 2. sp_GetServiceItems
--    Params: @ServiceId
--    Returns: active items only (customer / public view)
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_GetServiceItems
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ItemId,
        ServiceId,
        ItemName,
        Description,
        Price,
        ImageUrl,
        IsAvailable
    FROM dbo.ServiceItems
    WHERE ServiceId = @ServiceId
      AND ISNULL(IsAvailable, 1) = 1
    ORDER BY ItemId DESC;
END
GO

-- ------------------------------------------------------------
-- 2b. sp_GetProviderServiceItems
--     Params: @ServiceId
--     Returns: ALL items (active + soft-deleted) for provider manage page
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_GetProviderServiceItems
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ItemId,
        ServiceId,
        ItemName,
        Description,
        Price,
        ImageUrl,
        ISNULL(IsAvailable, 1) AS IsAvailable
    FROM dbo.ServiceItems
    WHERE ServiceId = @ServiceId
    ORDER BY IsAvailable DESC, ItemId DESC;
END
GO

-- ------------------------------------------------------------
-- 3. sp_UpdateServiceItem
--    Params: @ItemId, @ServiceId, @ItemName, @Description, @Price, @ImageUrl
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_UpdateServiceItem
    @ItemId      INT,
    @ServiceId   INT,
    @ItemName    NVARCHAR(150),
    @Description NVARCHAR(300) = NULL,
    @Price       DECIMAL(10,2),
    @ImageUrl    NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.ServiceItems
    SET ItemName    = @ItemName,
        Description = @Description,
        Price       = @Price,
        ImageUrl    = @ImageUrl
    WHERE ItemId = @ItemId
      AND ServiceId = @ServiceId;
END
GO

-- ------------------------------------------------------------
-- 4. sp_DeleteServiceItem  (soft delete — row stays in database)
--    Params: @ItemId, @ServiceId
--    Sets IsAvailable = 0 (hidden from customers, not physically deleted)
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_DeleteServiceItem
    @ItemId    INT,
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.ServiceItems
    SET IsAvailable = 0
    WHERE ItemId = @ItemId
      AND ServiceId = @ServiceId
      AND ISNULL(IsAvailable, 1) = 1;
END
GO

-- ------------------------------------------------------------
-- 5. sp_RestoreServiceItem
--    Params: @ItemId, @ServiceId
--    Sets IsAvailable = 1 (show again to customers)
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_RestoreServiceItem
    @ItemId    INT,
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.ServiceItems
    SET IsAvailable = 1
    WHERE ItemId = @ItemId
      AND ServiceId = @ServiceId;
END
GO
