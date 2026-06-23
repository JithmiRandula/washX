-- ============================================================
-- Migration: Add Status column to OrderItems +
--            Unique constraint on Orders.OrderReference
-- Run this ONCE in SSMS against LaundryAggregatorDb
-- ============================================================

-- 1. Add Status to OrderItems (prevents overallStatus query from failing)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.OrderItems') AND name = 'Status'
)
BEGIN
    ALTER TABLE dbo.OrderItems
        ADD Status NVARCHAR(50) NOT NULL
            CONSTRAINT DF_OrderItems_Status DEFAULT 'pending';
    PRINT 'Status column added to OrderItems.';
END
ELSE
    PRINT 'Status column already exists — no change.';
GO

-- 2. Unique constraint on OrderReference (blocks duplicate orders at DB level)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.Orders') AND name = 'UQ_Orders_OrderReference'
)
BEGIN
    ALTER TABLE dbo.Orders
        ADD CONSTRAINT UQ_Orders_OrderReference UNIQUE (OrderReference);
    PRINT 'Unique constraint added to Orders.OrderReference.';
END
ELSE
    PRINT 'Unique constraint already exists — no change.';
GO
