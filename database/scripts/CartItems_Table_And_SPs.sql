-- WashX — CartItems table + cart stored procedures
USE [LaundryAggregatorDb];
GO

IF OBJECT_ID('dbo.CartItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CartItems
    (
        CartItemId INT IDENTITY(1,1) PRIMARY KEY,
        CustomerId INT NOT NULL,
        ProviderId INT NOT NULL,
        -- ItemId is nullable because cart may contain bulk packages (stored in BulkItems)
        ItemId INT NULL,
        -- Kind: 'item' or 'bulk'
        Kind NVARCHAR(20) NOT NULL DEFAULT 'item',
        BulkItemId INT NULL,
        Quantity INT NOT NULL DEFAULT 1,
        Bags INT NULL,
        MaxKg DECIMAL(10,2) NULL,
        UnitPrice DECIMAL(18,2) NULL,
        Price DECIMAL(18,2) NULL,
        Description NVARCHAR(MAX) NULL,
        AddedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_CartItems_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId),
        CONSTRAINT FK_CartItems_Providers FOREIGN KEY (ProviderId) REFERENCES dbo.Providers(ProviderId),
        CONSTRAINT FK_CartItems_ServiceItems FOREIGN KEY (ItemId) REFERENCES dbo.ServiceItems(ItemId)
    );
END
GO

-- Ensure ItemId column is nullable so bulk rows can be inserted without ItemId
IF OBJECT_ID('dbo.CartItems', 'U') IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('dbo.CartItems') AND name = 'ItemId' AND is_nullable = 0
    )
    BEGIN
        ALTER TABLE dbo.CartItems ALTER COLUMN ItemId INT NULL;
    END
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_AddToCart
    @CustomerId INT,
    @ProviderId INT,
    @ItemId INT = NULL,
    @BulkItemId INT = NULL,
    @Kind NVARCHAR(20) = 'item',
    @Quantity INT = 1,
    @Bags INT = NULL,
    @MaxKg DECIMAL(10,2) = NULL,
    @UnitPrice DECIMAL(18,2) = NULL,
    @Price DECIMAL(18,2) = NULL,
    @Description NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Kind = 'item'
    BEGIN
        IF @ItemId IS NULL
            THROW 50000, 'ItemId is required for kind = item', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.CartItems
            WHERE CustomerId = @CustomerId AND ItemId = @ItemId AND Kind = 'item'
        )
        BEGIN
            UPDATE dbo.CartItems
            SET Quantity = Quantity + @Quantity, ProviderId = @ProviderId
            WHERE CustomerId = @CustomerId AND ItemId = @ItemId AND Kind = 'item';
        END
        ELSE
        BEGIN
            INSERT INTO dbo.CartItems (CustomerId, ProviderId, ItemId, Kind, Quantity, UnitPrice, Price, Description)
            VALUES (@CustomerId, @ProviderId, @ItemId, 'item', @Quantity, @UnitPrice, @Price, @Description);
        END
    END
    ELSE IF @Kind = 'bulk'
    BEGIN
        IF @BulkItemId IS NULL
            THROW 50001, 'BulkItemId is required for kind = bulk', 1;

        IF EXISTS (
            SELECT 1 FROM dbo.CartItems
            WHERE CustomerId = @CustomerId AND BulkItemId = @BulkItemId AND Kind = 'bulk'
        )
        BEGIN
            UPDATE dbo.CartItems
            SET Quantity = Quantity + @Quantity, ProviderId = @ProviderId
            WHERE CustomerId = @CustomerId AND BulkItemId = @BulkItemId AND Kind = 'bulk';
        END
        ELSE
        BEGIN
            INSERT INTO dbo.CartItems (CustomerId, ProviderId, Kind, BulkItemId, Quantity, Bags, MaxKg, UnitPrice, Price, Description)
            VALUES (@CustomerId, @ProviderId, 'bulk', @BulkItemId, @Quantity, @Bags, @MaxKg, @UnitPrice, @Price, @Description);
        END
    END
    ELSE
    BEGIN
        THROW 50002, 'Unsupported cart kind', 1;
    END
END
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
        c.Kind,
        c.BulkItemId,
        c.Quantity,
        c.Bags,
        c.MaxKg,
        c.UnitPrice,
        c.Price,
        c.Description AS CartDescription,
        c.AddedAt,
        si.ServiceId,
        si.ItemName,
        si.Description AS ItemDescription,
        si.Price AS ItemPrice,
        si.ImageUrl,
        p.BusinessName AS ProviderName
    FROM dbo.CartItems c
    LEFT JOIN dbo.ServiceItems si ON si.ItemId = c.ItemId
    LEFT JOIN dbo.BulkItems b ON b.BulkItemId = c.BulkItemId
    LEFT JOIN dbo.Providers p ON p.ProviderId = c.ProviderId
    WHERE c.CustomerId = @CustomerId
    ORDER BY c.AddedAt DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_IncreaseCartQuantity
    @CartItemId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.CartItems SET Quantity = Quantity + 1 WHERE CartItemId = @CartItemId;
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_DecreaseCartQuantity
    @CartItemId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.CartItems
    SET Quantity = Quantity - 1
    WHERE CartItemId = @CartItemId AND Quantity > 1;
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_DeleteCartItem
    @CartItemId INT,
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.CartItems
    WHERE CartItemId = @CartItemId AND CustomerId = @CustomerId;
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_ClearCartByCustomer
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.CartItems WHERE CustomerId = @CustomerId;
END
GO
