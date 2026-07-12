-- =====================================================================
-- Fix registration stored procedures to correctly save Latitude/Longitude
-- for both Customers and Providers.
-- Run this script once against [LaundryAggregatorDb].
-- =====================================================================
USE [LaundryAggregatorDb];
GO

-- ─────────────────────────────────────────────────────────────────────
-- 1. sp_RegisterUser
--    Creates the User row and returns the new UserId.
-- ─────────────────────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE dbo.sp_RegisterUser
    @Name         NVARCHAR(200),
    @Email        NVARCHAR(255),
    @Phone        NVARCHAR(50),
    @PasswordHash NVARCHAR(500),
    @Role         NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
    BEGIN
        RAISERROR('Email already registered.', 16, 1);
        RETURN;
    END

    INSERT INTO Users (Name, Email, Phone, PasswordHash, Role, CreatedAt)
    VALUES (@Name, @Email, @Phone, @PasswordHash, @Role, GETUTCDATE());

    SELECT SCOPE_IDENTITY() AS UserId;
END
GO

-- ─────────────────────────────────────────────────────────────────────
-- 2. sp_CreateCustomerProfile
--    Creates a Customer row linked to UserId.
--    Saves Address, Latitude, Longitude from registration.
-- ─────────────────────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE dbo.sp_CreateCustomerProfile
    @UserId    INT,
    @Address   NVARCHAR(500) = NULL,
    @Latitude  DECIMAL(18, 10) = NULL,
    @Longitude DECIMAL(18, 10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Customers (UserId, Address, Latitude, Longitude, LoyaltyPoints, CreatedAt)
    VALUES (@UserId, @Address, @Latitude, @Longitude, 0, GETUTCDATE());
END
GO

-- ─────────────────────────────────────────────────────────────────────
-- 3. sp_CreateProviderProfile
--    Creates a Provider row linked to UserId.
--    Saves BusinessAddress, Latitude, Longitude from registration.
-- ─────────────────────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE dbo.sp_CreateProviderProfile
    @UserId          INT,
    @BusinessName    NVARCHAR(200),
    @BusinessAddress NVARCHAR(500) = NULL,
    @Latitude        DECIMAL(18, 10) = NULL,
    @Longitude       DECIMAL(18, 10) = NULL,
    @Description     NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Providers
        (UserId, BusinessName, BusinessAddress, Latitude, Longitude, Description, Rating, IsVerified, CreatedAt)
    VALUES
        (@UserId, @BusinessName, @BusinessAddress, @Latitude, @Longitude, @Description, 0.0, 0, GETUTCDATE());
END
GO
