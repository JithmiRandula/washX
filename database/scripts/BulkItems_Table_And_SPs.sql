-- BulkItems table and stored procedures
IF OBJECT_ID('dbo.BulkItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BulkItems
    (
        BulkItemId INT IDENTITY(1,1) PRIMARY KEY,
        ServiceId INT NOT NULL,
        Name NVARCHAR(150) NOT NULL,
        IncludedCount INT NOT NULL DEFAULT 1,
        MaxWeightKg DECIMAL(6,2) NULL,
        Price DECIMAL(10,2) NOT NULL,
        ImageUrl NVARCHAR(500) NULL,
        IF OBJECT_ID('dbo.BulkItems', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.BulkItems (
                BulkItemId INT IDENTITY(1,1) PRIMARY KEY,
                ServiceId INT NOT NULL,
                Name NVARCHAR(200) NOT NULL,
                IncludedCount INT NOT NULL DEFAULT 1,
                MaxWeightKg DECIMAL(10,2) NULL,
                Price DECIMAL(10,2) NOT NULL,
                ImageUrl NVARCHAR(500) NULL,
                Description NVARCHAR(MAX) NULL,
                IsAvailable BIT NOT NULL DEFAULT 1,
                CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
            );

            ALTER TABLE dbo.BulkItems
            ADD CONSTRAINT FK_BulkItems_Services FOREIGN KEY (ServiceId) REFERENCES dbo.Services(ServiceId);
        END

        -- Drop procedures if they already exist and recreate them with robust SQL
        IF OBJECT_ID('dbo.sp_AddBulkItem', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_AddBulkItem;
        GO
        CREATE PROCEDURE dbo.sp_AddBulkItem
            @ServiceId INT,
            @Name NVARCHAR(200),
            @IncludedCount INT,
            @MaxWeightKg DECIMAL(10,2) = NULL,
            @Price DECIMAL(10,2),
            @ImageUrl NVARCHAR(500) = NULL,
            @Description NVARCHAR(MAX) = NULL
        AS
        SET NOCOUNT ON;
        BEGIN TRY
            BEGIN TRANSACTION;
            INSERT INTO dbo.BulkItems (ServiceId, Name, IncludedCount, MaxWeightKg, Price, ImageUrl, Description)
            VALUES (@ServiceId, @Name, @IncludedCount, @MaxWeightKg, @Price, @ImageUrl, @Description);

            DECLARE @Id INT = SCOPE_IDENTITY();
            COMMIT TRANSACTION;
            SELECT @Id AS BulkItemId;
        END TRY
        BEGIN CATCH
            IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
            DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrMsg, 16, 1);
        END CATCH;
        GO

        IF OBJECT_ID('dbo.sp_GetBulkItems', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetBulkItems;
        GO
        CREATE PROCEDURE dbo.sp_GetBulkItems
            @ServiceId INT
        AS
        SET NOCOUNT ON;
        SELECT BulkItemId, ServiceId, Name, IncludedCount, MaxWeightKg, Price, ImageUrl, Description, IsAvailable, CreatedAt
        FROM dbo.BulkItems
        WHERE ServiceId = @ServiceId AND IsAvailable = 1
        ORDER BY Price;
        GO

        IF OBJECT_ID('dbo.sp_GetProviderBulkItems', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetProviderBulkItems;
        GO
        CREATE PROCEDURE dbo.sp_GetProviderBulkItems
            @ServiceId INT
        AS
        SET NOCOUNT ON;
        SELECT BulkItemId, ServiceId, Name, IncludedCount, MaxWeightKg, Price, ImageUrl, Description, IsAvailable, CreatedAt
        FROM dbo.BulkItems
        WHERE ServiceId = @ServiceId
        ORDER BY CreatedAt DESC;
        GO

        IF OBJECT_ID('dbo.sp_UpdateBulkItem', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateBulkItem;
        GO
        CREATE PROCEDURE dbo.sp_UpdateBulkItem
            @BulkItemId INT,
            @ServiceId INT,
            @Name NVARCHAR(200),
            @IncludedCount INT,
            @MaxWeightKg DECIMAL(10,2) = NULL,
            @Price DECIMAL(10,2),
            @ImageUrl NVARCHAR(500) = NULL,
            @Description NVARCHAR(MAX) = NULL
        AS
        SET NOCOUNT ON;
        BEGIN TRY
            BEGIN TRANSACTION;
            UPDATE dbo.BulkItems
            SET ServiceId = @ServiceId,
                Name = @Name,
                IncludedCount = @IncludedCount,
                MaxWeightKg = @MaxWeightKg,
                Price = @Price,
                ImageUrl = @ImageUrl,
                Description = @Description
            WHERE BulkItemId = @BulkItemId;
            COMMIT TRANSACTION;
            SELECT @@ROWCOUNT AS RowsAffected;
        END TRY
        BEGIN CATCH
            IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
            DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrMsg, 16, 1);
        END CATCH;
        GO

        -- Hard delete: permanently remove the row
        IF OBJECT_ID('dbo.sp_DeleteBulkItem', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteBulkItem;
        GO
        CREATE PROCEDURE dbo.sp_DeleteBulkItem
            @BulkItemId INT
        AS
        SET NOCOUNT ON;
        BEGIN TRY
            BEGIN TRANSACTION;
            DELETE FROM dbo.BulkItems WHERE BulkItemId = @BulkItemId;
            COMMIT TRANSACTION;
            SELECT @@ROWCOUNT AS RowsAffected;
        END TRY
        BEGIN CATCH
            IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
            DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrMsg, 16, 1);
        END CATCH;
        GO

        -- Restore is retained for compatibility but will only work if record still exists (not applicable after hard-delete)
        IF OBJECT_ID('dbo.sp_RestoreBulkItem', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_RestoreBulkItem;
        GO
        CREATE PROCEDURE dbo.sp_RestoreBulkItem
            @BulkItemId INT
        AS
        SET NOCOUNT ON;
        BEGIN TRY
            UPDATE dbo.BulkItems SET IsAvailable = 1 WHERE BulkItemId = @BulkItemId;
            SELECT @@ROWCOUNT AS RowsAffected;
        END TRY
        BEGIN CATCH
            DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrMsg, 16, 1);
        END CATCH;
        GO
    DROP PROCEDURE dbo.sp_DeleteBulkItem;
GO
CREATE PROCEDURE dbo.sp_DeleteBulkItem
    @BulkItemId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.BulkItems WHERE BulkItemId = @BulkItemId;
END;
GO

IF OBJECT_ID('dbo.sp_RestoreBulkItem', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RestoreBulkItem;
GO
CREATE PROCEDURE dbo.sp_RestoreBulkItem
    @BulkItemId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.BulkItems SET IsAvailable = 1 WHERE BulkItemId = @BulkItemId;
END;
GO
