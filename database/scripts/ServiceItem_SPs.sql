-- WashX — ServiceItems (ServiceId FK, matches your schema)
USE [LaundryAggregatorDb];
GO

IF COL_LENGTH('dbo.ServiceItems', 'ServiceTypeId') IS NOT NULL
   AND COL_LENGTH('dbo.ServiceItems', 'ServiceId') IS NULL
    EXEC sp_rename 'dbo.ServiceItems.ServiceTypeId', 'ServiceId', 'COLUMN';
GO

IF OBJECT_ID('dbo.ServiceItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ServiceItems
    (
        ItemId INT IDENTITY(1,1) PRIMARY KEY,
        ServiceId INT NOT NULL,
        ItemName NVARCHAR(150) NOT NULL,
        Description NVARCHAR(300) NULL,
        Price DECIMAL(10,2) NOT NULL,
        ImageUrl NVARCHAR(500) NULL,
        IsAvailable BIT NOT NULL DEFAULT 1,
        CONSTRAINT FK_ServiceItems_Services FOREIGN KEY (ServiceId) REFERENCES dbo.Services(ServiceId)
    );
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_AddServiceItem
    @ServiceId INT,
    @ItemName NVARCHAR(150),
    @Description NVARCHAR(300),
    @Price DECIMAL(10,2),
    @ImageUrl NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.ServiceItems (ServiceId, ItemName, Description, Price, ImageUrl)
    VALUES (@ServiceId, @ItemName, @Description, @Price, @ImageUrl);
    SELECT SCOPE_IDENTITY() AS ItemId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetServiceItems
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM dbo.ServiceItems
    WHERE ServiceId = @ServiceId AND IsAvailable = 1
    ORDER BY ItemId DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_UpdateServiceItem
    @ItemId INT,
    @ServiceId INT,
    @ItemName NVARCHAR(150),
    @Description NVARCHAR(300),
    @Price DECIMAL(10,2),
    @ImageUrl NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.ServiceItems
    SET ItemName = @ItemName,
        Description = @Description,
        Price = @Price,
        ImageUrl = @ImageUrl
    WHERE ItemId = @ItemId AND ServiceId = @ServiceId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_DeleteServiceItem
    @ItemId INT,
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.ServiceItems
    SET IsAvailable = 0
    WHERE ItemId = @ItemId AND ServiceId = @ServiceId;
END
GO
