-- ============================================================
-- Migration: Add Status column to OrderItems
-- Run this ONCE in SSMS against LaundryAggregatorDb
-- ============================================================

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
BEGIN
    PRINT 'Status column already exists — no change.';
END
GO
