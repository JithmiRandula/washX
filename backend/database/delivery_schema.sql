/*
    WashX — Provider delivery/transport feature schema
    Run this once against LaundryAggregatorDb (e.g. in SSMS) before using
    the provider delivery-settings + order delivery feature.

    No stored procedures required — inline parameterized SQL, same style
    as the Orders/Chat features.
*/

USE LaundryAggregatorDb;
GO

-- Provider's own delivery/transport capability + flat fee
IF COL_LENGTH('dbo.Providers', 'OffersDelivery') IS NULL
    ALTER TABLE dbo.Providers ADD OffersDelivery BIT NOT NULL DEFAULT 0;
GO
IF COL_LENGTH('dbo.Providers', 'DeliveryFee') IS NULL
    ALTER TABLE dbo.Providers ADD DeliveryFee DECIMAL(10,2) NOT NULL DEFAULT 0;
GO

-- Per (Order, Provider) delivery choice + live status.
-- An order can span multiple providers, so this is tracked per provider-group
-- within the order rather than once on the Order row.
IF OBJECT_ID('dbo.OrderProviderDeliveries', 'U') IS NOT NULL DROP TABLE dbo.OrderProviderDeliveries;
GO

CREATE TABLE dbo.OrderProviderDeliveries (
    OrderId         INT NOT NULL,
    ProviderId      INT NOT NULL,
    DeliveryOption  VARCHAR(10) NOT NULL DEFAULT 'self',   -- 'self' | 'provider'
    DeliveryFee     DECIMAL(10,2) NOT NULL DEFAULT 0,
    DeliveryStatus  VARCHAR(20) NULL,                       -- 'pending' | 'picked_up' | 'on_the_way' | 'delivered'
    UpdatedAt       DATETIME NULL,

    CONSTRAINT PK_OrderProviderDeliveries PRIMARY KEY (OrderId, ProviderId),
    CONSTRAINT FK_OPD_Order    FOREIGN KEY (OrderId)    REFERENCES dbo.Orders(OrderId),
    CONSTRAINT FK_OPD_Provider FOREIGN KEY (ProviderId) REFERENCES dbo.Providers(ProviderId),
    CONSTRAINT CK_OPD_Option   CHECK (DeliveryOption IN ('self', 'provider')),
    CONSTRAINT CK_OPD_Status   CHECK (DeliveryStatus IS NULL OR DeliveryStatus IN ('pending','picked_up','on_the_way','delivered'))
);
GO

CREATE INDEX IX_OPD_Provider ON dbo.OrderProviderDeliveries (ProviderId);
GO
