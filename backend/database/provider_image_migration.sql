/*
    WashX — provider business profile fields.
    Adds: ImageUrl (logo/business photo, via Cloudinary — shown to customers on Find
    Providers / homepage cards instead of a fixed placeholder), plus the extra
    Business Profile page fields (license, city/state/zip, operating hours as JSON)
    that the provider profile edit form already collected but had nowhere to save.
    Run once against LaundryAggregatorDb.
*/

USE LaundryAggregatorDb;
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Providers' AND COLUMN_NAME = 'ImageUrl')
ALTER TABLE dbo.Providers ADD ImageUrl NVARCHAR(500) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Providers' AND COLUMN_NAME = 'BusinessLicense')
ALTER TABLE dbo.Providers ADD BusinessLicense NVARCHAR(100) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Providers' AND COLUMN_NAME = 'City')
ALTER TABLE dbo.Providers ADD City NVARCHAR(100) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Providers' AND COLUMN_NAME = 'State')
ALTER TABLE dbo.Providers ADD State NVARCHAR(100) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Providers' AND COLUMN_NAME = 'ZipCode')
ALTER TABLE dbo.Providers ADD ZipCode NVARCHAR(20) NULL;
GO

-- JSON blob: { monday: { open, close, isClosed }, ... } — provider-only, no other
-- part of the app reads it yet, so a single text column is enough (no new table).
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Providers' AND COLUMN_NAME = 'OperatingHours')
ALTER TABLE dbo.Providers ADD OperatingHours NVARCHAR(MAX) NULL;
GO
