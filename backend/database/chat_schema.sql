/*
    WashX — Chat feature schema
    Run this once against the LaundryAggregatorDb database (e.g. in SSMS)
    before using the customer <-> provider chat feature.

    No stored procedures required — the ChatRepository uses inline
    parameterized SQL, same style as the Orders feature.
*/

USE LaundryAggregatorDb;
GO

IF OBJECT_ID('dbo.ChatMessages', 'U') IS NOT NULL DROP TABLE dbo.ChatMessages;
IF OBJECT_ID('dbo.ChatConversations', 'U') IS NOT NULL DROP TABLE dbo.ChatConversations;
GO

-- One row per (Customer, Provider) pair — the thread they share.
CREATE TABLE dbo.ChatConversations (
    ConversationId  INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      INT NOT NULL,
    ProviderId      INT NOT NULL,
    CreatedAt       DATETIME NOT NULL DEFAULT GETDATE(),
    LastMessageAt   DATETIME NULL,

    CONSTRAINT FK_ChatConversations_Customer FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId),
    CONSTRAINT FK_ChatConversations_Provider FOREIGN KEY (ProviderId) REFERENCES dbo.Providers(ProviderId),
    CONSTRAINT UQ_ChatConversations_Pair UNIQUE (CustomerId, ProviderId)
);
GO

-- Individual messages within a conversation.
CREATE TABLE dbo.ChatMessages (
    MessageId       INT IDENTITY(1,1) PRIMARY KEY,
    ConversationId  INT NOT NULL,
    SenderRole      VARCHAR(10) NOT NULL,   -- 'customer' | 'provider'
    SenderUserId    INT NOT NULL,
    Body            NVARCHAR(2000) NOT NULL,
    IsRead          BIT NOT NULL DEFAULT 0, -- has the OTHER party read it
    CreatedAt       DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ChatMessages_Conversation FOREIGN KEY (ConversationId) REFERENCES dbo.ChatConversations(ConversationId),
    CONSTRAINT FK_ChatMessages_SenderUser FOREIGN KEY (SenderUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_ChatMessages_SenderRole CHECK (SenderRole IN ('customer', 'provider'))
);
GO

CREATE INDEX IX_ChatMessages_Conversation_CreatedAt ON dbo.ChatMessages (ConversationId, CreatedAt);
CREATE INDEX IX_ChatConversations_Customer ON dbo.ChatConversations (CustomerId);
CREATE INDEX IX_ChatConversations_Provider ON dbo.ChatConversations (ProviderId);
GO
