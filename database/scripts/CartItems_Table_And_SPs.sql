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
        ItemId INT NOT NULL,
        Quantity INT NOT NULL DEFAULT 1,
        AddedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_CartItems_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId),
        CONSTRAINT FK_CartItems_Providers FOREIGN KEY (ProviderId) REFERENCES dbo.Providers(ProviderId),
        CONSTRAINT FK_CartItems_ServiceItems FOREIGN KEY (ItemId) REFERENCES dbo.ServiceItems(ItemId)
    );
END
GO

CREATE OR ALTER PROCEDURE dbo.SP_AddToCart
    @CustomerId INT,
    @ProviderId INT,
    @ItemId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM dbo.CartItems
        WHERE CustomerId = @CustomerId AND ItemId = @ItemId
    )
    BEGIN
        UPDATE dbo.CartItems
        SET Quantity = Quantity + 1, ProviderId = @ProviderId
        WHERE CustomerId = @CustomerId AND ItemId = @ItemId;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.CartItems (CustomerId, ProviderId, ItemId, Quantity)
        VALUES (@CustomerId, @ProviderId, @ItemId, 1);
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
        c.Quantity,
        c.AddedAt,
        si.ServiceId,
        si.ItemName,
        si.Description,
        si.Price,
        si.ImageUrl,
        p.BusinessName AS ProviderName
    FROM dbo.CartItems c
    INNER JOIN dbo.ServiceItems si ON si.ItemId = c.ItemId
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
