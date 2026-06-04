-- WashX — Services (matches your schema + backend)
USE [LaundryAggregatorDb];
GO

-- Optional: rename Price -> BasePrice if old column exists
IF COL_LENGTH('dbo.Services', 'Price') IS NOT NULL AND COL_LENGTH('dbo.Services', 'BasePrice') IS NULL
    EXEC sp_rename 'dbo.Services.Price', 'BasePrice', 'COLUMN';
GO

IF OBJECT_ID('dbo.Services', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Services
    (
        ServiceId INT IDENTITY(1,1) PRIMARY KEY,
        ProviderId INT NOT NULL,
        ServiceName NVARCHAR(150) NOT NULL,
        Category NVARCHAR(100) NOT NULL,
        PricingType NVARCHAR(30) NOT NULL,
        BasePrice DECIMAL(10,2) NOT NULL,
        MinimumOrder INT NOT NULL DEFAULT 1,
        TurnaroundTime NVARCHAR(50) NULL,
        Description NVARCHAR(500) NULL,
        KeyFeatures NVARCHAR(500) NULL,
        SpecialInstructions NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Services_Providers FOREIGN KEY (ProviderId) REFERENCES dbo.Providers(ProviderId)
    );
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_AddService
    @ProviderId INT,
    @ServiceName NVARCHAR(150),
    @Category NVARCHAR(100),
    @PricingType NVARCHAR(30),
    @BasePrice DECIMAL(10,2),
    @MinimumOrder INT,
    @TurnaroundTime NVARCHAR(50) = NULL,
    @Description NVARCHAR(500) = NULL,
    @KeyFeatures NVARCHAR(500) = NULL,
    @SpecialInstructions NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Services (
        ProviderId, ServiceName, Category, PricingType,
        BasePrice, MinimumOrder, TurnaroundTime,
        Description, KeyFeatures, SpecialInstructions
    )
    VALUES (
        @ProviderId, @ServiceName, @Category, @PricingType,
        @BasePrice, @MinimumOrder, @TurnaroundTime,
        @Description, @KeyFeatures, @SpecialInstructions
    );
    SELECT SCOPE_IDENTITY() AS ServiceId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_UpdateService
    @ServiceId INT,
    @ServiceName NVARCHAR(150),
    @Category NVARCHAR(100),
    @PricingType NVARCHAR(30),
    @BasePrice DECIMAL(10,2),
    @MinimumOrder INT,
    @TurnaroundTime NVARCHAR(50) = NULL,
    @Description NVARCHAR(500) = NULL,
    @KeyFeatures NVARCHAR(500) = NULL,
    @SpecialInstructions NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Services
    SET ServiceName = @ServiceName,
        Category = @Category,
        PricingType = @PricingType,
        BasePrice = @BasePrice,
        MinimumOrder = @MinimumOrder,
        TurnaroundTime = @TurnaroundTime,
        Description = @Description,
        KeyFeatures = @KeyFeatures,
        SpecialInstructions = @SpecialInstructions
    WHERE ServiceId = @ServiceId AND IsActive = 1;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_DeleteService
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Services SET IsActive = 0 WHERE ServiceId = @ServiceId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetProviderServices
    @ProviderId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM dbo.Services
    WHERE ProviderId = @ProviderId AND IsActive = 1
    ORDER BY ServiceId DESC;
END
GO
