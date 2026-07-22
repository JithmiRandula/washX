/*
    WashX — Weight-based Bulk Laundry Request workflow
    Replaces the old "fixed Bulk Item" model. A bulk Service (Services.PricingType = per-kg)
    already carries everything a provider needs to define (name, price/kg, min order,
    turnaround, description, features, instructions) — no schema change needed there.

    This script adds the new BulkRequests table: one row per bulk/weight-based booking,
    created BEFORE price/payment are known, and driven through a status pipeline as the
    provider receives, weighs, and processes the laundry.

    No stored procedures — inline parameterized SQL, same style as Chat/Delivery/Notifications.
    Run once against LaundryAggregatorDb.
*/

USE LaundryAggregatorDb;
GO

IF OBJECT_ID('dbo.BulkRequests', 'U') IS NOT NULL DROP TABLE dbo.BulkRequests;
GO

CREATE TABLE dbo.BulkRequests (
    BulkRequestId     INT IDENTITY(1,1) PRIMARY KEY,
    RequestReference  NVARCHAR(100)  NOT NULL,
    CustomerId        INT            NOT NULL,
    ProviderId        INT            NOT NULL,
    ServiceId         INT            NOT NULL,

    FulfillmentMethod VARCHAR(10)    NOT NULL,              -- 'pickup' | 'dropoff'
    Address           NVARCHAR(300)  NULL,                  -- required snapshot when FulfillmentMethod = 'pickup'
    PreferredDate     DATE           NULL,
    PreferredSlot     NVARCHAR(50)   NULL,                  -- e.g. Morning / Afternoon / Evening
    Notes             NVARCHAR(500)  NULL,

    -- Status pipeline (see backend BulkRequestRepository for the exact transition rules):
    --   pending_request -> pickup_scheduled|awaiting_dropoff -> received -> awaiting_confirmation
    --   -> payment_pending -> paid -> processing -> ready -> completed
    -- 'cancelled' is reachable from any pre-payment state (customer/provider cancel or reject).
    Status            VARCHAR(30)    NOT NULL DEFAULT 'pending_request',

    PricePerKg        DECIMAL(10,2)  NOT NULL,               -- snapshot of the service's per-kg price at request time
    ActualWeightKg    DECIMAL(6,2)   NULL,
    FinalPrice        DECIMAL(10,2)  NULL,                   -- ActualWeightKg * PricePerKg, set once weighed

    PaymentProvider   NVARCHAR(50)   NULL,
    PaymentStatus     NVARCHAR(30)   NULL,

    CreatedAt         DATETIME       NOT NULL DEFAULT GETDATE(),
    AcceptedAt        DATETIME       NULL,
    ReceivedAt        DATETIME       NULL,
    WeighedAt         DATETIME       NULL,
    ConfirmedAt       DATETIME       NULL,                   -- customer confirmed the final price
    PaidAt            DATETIME       NULL,
    ProcessingAt      DATETIME       NULL,
    ReadyAt           DATETIME       NULL,
    CompletedAt       DATETIME       NULL,
    CancelledAt       DATETIME       NULL,

    CONSTRAINT UQ_BulkRequests_Reference UNIQUE (RequestReference),
    CONSTRAINT FK_BulkRequests_Customer FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId),
    CONSTRAINT FK_BulkRequests_Provider FOREIGN KEY (ProviderId) REFERENCES dbo.Providers(ProviderId),
    CONSTRAINT FK_BulkRequests_Service  FOREIGN KEY (ServiceId)  REFERENCES dbo.Services(ServiceId),
    CONSTRAINT CK_BulkRequests_Fulfillment CHECK (FulfillmentMethod IN ('pickup', 'dropoff')),
    CONSTRAINT CK_BulkRequests_Status CHECK (Status IN (
        'pending_request', 'pickup_scheduled', 'awaiting_dropoff', 'received',
        'awaiting_confirmation', 'payment_pending', 'paid', 'processing',
        'ready', 'completed', 'cancelled'
    ))
);
GO

CREATE INDEX IX_BulkRequests_Customer ON dbo.BulkRequests (CustomerId);
CREATE INDEX IX_BulkRequests_Provider ON dbo.BulkRequests (ProviderId);
GO
