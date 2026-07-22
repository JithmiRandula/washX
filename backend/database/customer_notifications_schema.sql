/*
    WashX — Customer-facing notifications
    Extends the existing (provider-only) Notifications table so it can also
    hold notifications addressed to a customer (e.g. "your order is complete").

    Run once against LaundryAggregatorDb.
*/

USE LaundryAggregatorDb;
GO

IF COL_LENGTH('dbo.Notifications', 'CustomerId') IS NULL
    ALTER TABLE dbo.Notifications ADD CustomerId INT NULL;
GO

IF COL_LENGTH('dbo.Notifications', 'RecipientRole') IS NULL
    ALTER TABLE dbo.Notifications ADD RecipientRole VARCHAR(10) NOT NULL DEFAULT 'provider';
GO

IF COL_LENGTH('dbo.Notifications', 'ProviderName') IS NULL
    ALTER TABLE dbo.Notifications ADD ProviderName NVARCHAR(200) NULL;
GO

-- Existing rows predate RecipientRole — make sure they're explicitly tagged.
UPDATE dbo.Notifications SET RecipientRole = 'provider' WHERE RecipientRole IS NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Notifications_Customer')
    ALTER TABLE dbo.Notifications ADD CONSTRAINT FK_Notifications_Customer
        FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Notifications_Customer' AND object_id = OBJECT_ID('dbo.Notifications'))
    CREATE INDEX IX_Notifications_Customer ON dbo.Notifications (CustomerId) WHERE CustomerId IS NOT NULL;
GO
