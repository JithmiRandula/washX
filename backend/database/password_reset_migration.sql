/*
    WashX — Forgot/Reset Password support.
    Adds a single-active-token column pair to Users: a new forgot-password request
    simply overwrites any previous token, so there's no need for a separate table.
    Run once against LaundryAggregatorDb.
*/

USE LaundryAggregatorDb;
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'ResetToken')
ALTER TABLE dbo.Users ADD ResetToken NVARCHAR(200) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'ResetTokenExpiry')
ALTER TABLE dbo.Users ADD ResetTokenExpiry DATETIME NULL;
GO
