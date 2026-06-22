-- Orders + OrderItems DDL and stored procedures
-- Safe to re-run: checks for existence before creating/dropping objects

/* ===========================
   1) Tables
   =========================== */

IF OBJECT_ID('dbo.Orders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Orders (
        OrderId INT IDENTITY(1,1) PRIMARY KEY,
        OrderReference NVARCHAR(100) NOT NULL,
        CustomerId INT NOT NULL,
        TotalAmount DECIMAL(18,2) NOT NULL,
        PaymentProvider NVARCHAR(50) NULL,
        PaymentStatus NVARCHAR(50) NULL,
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Orders_CustomerId ON dbo.Orders(CustomerId);
    CREATE INDEX IX_Orders_OrderReference ON dbo.Orders(OrderReference);
END

IF OBJECT_ID('dbo.OrderItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrderItems (
        OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
        OrderId INT NOT NULL,
        ProviderId INT NOT NULL,
        ServiceId INT NULL,
        ItemId INT NULL,
        Kind NVARCHAR(20) NOT NULL,         -- 'item' or 'bulk'
        Quantity INT NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_OrderItems_OrderId ON dbo.OrderItems(OrderId);
END

GO

/* ===========================
   2) Foreign keys
   Orders.CustomerId -> Customers.CustomerId
   OrderItems.OrderId -> Orders.OrderId
   (Guarded so it only runs if referenced tables exist and FK doesn't already exist)
   =========================== */

IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys fk
        WHERE fk.parent_object_id = OBJECT_ID('dbo.Orders')
          AND fk.referenced_object_id = OBJECT_ID('dbo.Customers')
    )
    BEGIN
        ALTER TABLE dbo.Orders
        ADD CONSTRAINT FK_Orders_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId);
    END
END

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys fk
    WHERE fk.parent_object_id = OBJECT_ID('dbo.OrderItems')
      AND fk.referenced_object_id = OBJECT_ID('dbo.Orders')
)
BEGIN
    ALTER TABLE dbo.OrderItems
    ADD CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId) ON DELETE CASCADE;
END

GO

/* ===========================
   3) Stored procedures
   - SP_AddOrder: inserts one order, returns new OrderId
   - SP_AddOrderItem: inserts a single order item
   - SP_GetOrderById: returns 2 result sets (order row, then items)
   - SP_GetOrdersByCustomer: returns all orders for a customer
   =========================== */

IF OBJECT_ID('dbo.SP_AddOrder', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_AddOrder;
GO
CREATE PROCEDURE dbo.SP_AddOrder
    @OrderReference NVARCHAR(100),
    @CustomerId INT,
    @TotalAmount DECIMAL(18,2),
    @PaymentProvider NVARCHAR(50) = NULL,
    @PaymentStatus NVARCHAR(50) = NULL,
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        INSERT INTO dbo.Orders (OrderReference, CustomerId, TotalAmount, PaymentProvider, PaymentStatus, Notes)
        VALUES (@OrderReference, @CustomerId, @TotalAmount, @PaymentProvider, @PaymentStatus, @Notes);

        SELECT CAST(SCOPE_IDENTITY() AS INT) AS OrderId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

IF OBJECT_ID('dbo.SP_AddOrderItem', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_AddOrderItem;
GO
CREATE PROCEDURE dbo.SP_AddOrderItem
    @OrderId INT,
    @ProviderId INT,
    @ServiceId INT = NULL,
    @ItemId INT = NULL,
    @Kind NVARCHAR(20),
    @Quantity INT,
    @UnitPrice DECIMAL(18,2),
    @Price DECIMAL(18,2),
    @Description NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.OrderItems (OrderId, ProviderId, ServiceId, ItemId, Kind, Quantity, UnitPrice, Price, Description)
    VALUES (@OrderId, @ProviderId, @ServiceId, @ItemId, @Kind, @Quantity, @UnitPrice, @Price, @Description);
END
GO

IF OBJECT_ID('dbo.SP_GetOrderById', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GetOrderById;
GO
CREATE PROCEDURE dbo.SP_GetOrderById
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;
    -- First result: order row
    SELECT * FROM dbo.Orders WHERE OrderId = @OrderId;
    -- Second result: the items
    SELECT * FROM dbo.OrderItems WHERE OrderId = @OrderId ORDER BY OrderItemId;
END
GO

IF OBJECT_ID('dbo.SP_GetOrdersByCustomer', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GetOrdersByCustomer;
GO
CREATE PROCEDURE dbo.SP_GetOrdersByCustomer
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.Orders WHERE CustomerId = @CustomerId ORDER BY CreatedAt DESC;
END
GO
