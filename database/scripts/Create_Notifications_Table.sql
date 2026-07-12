USE [LaundryAggregatorDb];
GO

-- ── 1. Create Notifications Table ─────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE dbo.Notifications (
        NotificationId  INT           IDENTITY(1,1)  PRIMARY KEY,
        ProviderId      INT           NOT NULL        REFERENCES dbo.Providers(ProviderId),
        OrderId         INT           NULL,
        OrderReference  NVARCHAR(100) NULL,
        CustomerName    NVARCHAR(200) NULL,
        Title           NVARCHAR(200) NOT NULL,
        Message         NVARCHAR(500) NOT NULL,
        IsRead          BIT           NOT NULL        DEFAULT 0,
        CreatedAt       DATETIME      NOT NULL        DEFAULT GETDATE()
    );
    CREATE INDEX IX_Notifications_ProviderId ON dbo.Notifications(ProviderId);
    CREATE INDEX IX_Notifications_CreatedAt  ON dbo.Notifications(CreatedAt DESC);
    PRINT 'Notifications table created.';
END
ELSE
    PRINT 'Notifications table already exists.';
GO

-- ── 2. SP_AddNotification ─────────────────────────────────────────────────
-- Takes all values directly from C# — no JOINs that can silently fail.
IF OBJECT_ID('dbo.SP_AddNotification', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_AddNotification;
GO
CREATE PROCEDURE dbo.SP_AddNotification
    @ProviderId     INT,
    @OrderId        INT,
    @OrderReference NVARCHAR(100),
    @CustomerName   NVARCHAR(200),
    @TotalAmount    DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Msg NVARCHAR(500);
    SET @Msg = ISNULL(@CustomerName, N'A customer')
             + N' placed order #' + ISNULL(@OrderReference, N'N/A')
             + N' - Rs ' + CONVERT(NVARCHAR(20), @TotalAmount);

    INSERT INTO dbo.Notifications
        (ProviderId, OrderId, OrderReference, CustomerName, Title, Message)
    VALUES
        (@ProviderId, @OrderId, @OrderReference, @CustomerName,
         N'New Order Received', @Msg);
END;
GO

-- ── 3. SP_GetNotificationsByProvider ─────────────────────────────────────
IF OBJECT_ID('dbo.SP_GetNotificationsByProvider', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GetNotificationsByProvider;
GO
CREATE PROCEDURE dbo.SP_GetNotificationsByProvider
    @ProviderId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 50
        NotificationId, ProviderId, OrderId, OrderReference,
        CustomerName, Title, Message, IsRead, CreatedAt
    FROM  dbo.Notifications
    WHERE ProviderId = @ProviderId
    ORDER BY CreatedAt DESC;
END;
GO

-- ── 4. SP_GetUnreadNotificationCount ──────────────────────────────────────
IF OBJECT_ID('dbo.SP_GetUnreadNotificationCount', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_GetUnreadNotificationCount;
GO
CREATE PROCEDURE dbo.SP_GetUnreadNotificationCount
    @ProviderId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) AS UnreadCount
    FROM  dbo.Notifications
    WHERE ProviderId = @ProviderId AND IsRead = 0;
END;
GO

-- ── 5. SP_MarkNotificationRead ────────────────────────────────────────────
IF OBJECT_ID('dbo.SP_MarkNotificationRead', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_MarkNotificationRead;
GO
CREATE PROCEDURE dbo.SP_MarkNotificationRead
    @NotificationId INT,
    @ProviderId     INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Notifications
    SET    IsRead = 1
    WHERE  NotificationId = @NotificationId AND ProviderId = @ProviderId;
END;
GO

-- ── 6. SP_MarkAllNotificationsRead ────────────────────────────────────────
IF OBJECT_ID('dbo.SP_MarkAllNotificationsRead', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_MarkAllNotificationsRead;
GO
CREATE PROCEDURE dbo.SP_MarkAllNotificationsRead
    @ProviderId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Notifications
    SET    IsRead = 1
    WHERE  ProviderId = @ProviderId AND IsRead = 0;
END;
GO

-- ── 7. SP_DeleteNotification ──────────────────────────────────────────────
IF OBJECT_ID('dbo.SP_DeleteNotification', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_DeleteNotification;
GO
CREATE PROCEDURE dbo.SP_DeleteNotification
    @NotificationId INT,
    @ProviderId     INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Notifications
    WHERE  NotificationId = @NotificationId AND ProviderId = @ProviderId;
END;
GO

PRINT 'All 6 notification stored procedures created successfully.';
GO

-- ── Quick verification ─────────────────────────────────────────────────────
SELECT 'Notifications table' AS Object, 'EXISTS' AS Status
WHERE  EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Notifications')
UNION ALL
SELECT name, 'SP EXISTS' FROM sys.procedures
WHERE  name IN (
    'SP_AddNotification',
    'SP_GetNotificationsByProvider',
    'SP_GetUnreadNotificationCount',
    'SP_MarkNotificationRead',
    'SP_MarkAllNotificationsRead',
    'SP_DeleteNotification'
);
