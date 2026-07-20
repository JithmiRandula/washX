using System.Data;
using Laundry.DAL.DbHelper;
using Laundry.Models;
using Microsoft.Data.SqlClient;

namespace Laundry.DAL.Repositories;

public sealed class ChatRepository(SqlHelper sql)
{
    private readonly SqlHelper _sql = sql;

    // Returns the existing conversation for this customer/provider pair, or creates one.
    public async Task<int> GetOrCreateConversation(int customerId, int providerId)
    {
        SqlParameter[] lookup = [new("@CustomerId", customerId), new("@ProviderId", providerId)];

        var existing = await _sql.ExecuteScalarAsync<int?>(
            "SELECT ConversationId FROM dbo.ChatConversations WHERE CustomerId = @CustomerId AND ProviderId = @ProviderId",
            lookup);
        if (existing is int id) return id;

        SqlParameter[] insert = [new("@CustomerId", customerId), new("@ProviderId", providerId)];
        return await _sql.ExecuteScalarAsync<int>(
            """
            INSERT INTO dbo.ChatConversations (CustomerId, ProviderId, CreatedAt)
            OUTPUT INSERTED.ConversationId
            VALUES (@CustomerId, @ProviderId, GETDATE())
            """,
            insert);
    }

    public Task<ChatConversation?> GetConversationById(int conversationId)
    {
        SqlParameter[] p = [new("@ConversationId", conversationId)];
        return _sql.ExecuteSingleAsync(
            "SELECT ConversationId, CustomerId, ProviderId, CreatedAt, LastMessageAt FROM dbo.ChatConversations WHERE ConversationId = @ConversationId",
            p, MapConversationBasic);
    }

    public Task<List<ChatConversation>> GetForCustomer(int customerId)
    {
        SqlParameter[] p = [new("@CustomerId", customerId)];
        const string sqlText = """
            SELECT c.ConversationId, c.CustomerId, c.ProviderId, c.CreatedAt, c.LastMessageAt,
                   p.BusinessName AS OtherPartyName,
                   (SELECT TOP 1 m.Body FROM dbo.ChatMessages m WHERE m.ConversationId = c.ConversationId ORDER BY m.CreatedAt DESC) AS LastMessage,
                   (SELECT COUNT(*) FROM dbo.ChatMessages m WHERE m.ConversationId = c.ConversationId AND m.SenderRole = 'provider' AND m.IsRead = 0) AS UnreadCount
            FROM dbo.ChatConversations c
            INNER JOIN dbo.Providers p ON p.ProviderId = c.ProviderId
            WHERE c.CustomerId = @CustomerId
            ORDER BY ISNULL(c.LastMessageAt, c.CreatedAt) DESC
            """;
        return _sql.ExecuteListAsync(sqlText, p, MapConversationSummary);
    }

    public Task<List<ChatConversation>> GetForProvider(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        const string sqlText = """
            SELECT c.ConversationId, c.CustomerId, c.ProviderId, c.CreatedAt, c.LastMessageAt,
                   u.Name AS OtherPartyName,
                   (SELECT TOP 1 m.Body FROM dbo.ChatMessages m WHERE m.ConversationId = c.ConversationId ORDER BY m.CreatedAt DESC) AS LastMessage,
                   (SELECT COUNT(*) FROM dbo.ChatMessages m WHERE m.ConversationId = c.ConversationId AND m.SenderRole = 'customer' AND m.IsRead = 0) AS UnreadCount
            FROM dbo.ChatConversations c
            INNER JOIN dbo.Customers cu ON cu.CustomerId = c.CustomerId
            INNER JOIN dbo.Users u ON u.UserId = cu.UserId
            WHERE c.ProviderId = @ProviderId
            ORDER BY ISNULL(c.LastMessageAt, c.CreatedAt) DESC
            """;
        return _sql.ExecuteListAsync(sqlText, p, MapConversationSummary);
    }

    public Task<List<ChatMessage>> GetMessages(int conversationId)
    {
        SqlParameter[] p = [new("@ConversationId", conversationId)];
        const string sqlText = """
            SELECT MessageId, ConversationId, SenderRole, SenderUserId, Body, IsRead, CreatedAt
            FROM dbo.ChatMessages
            WHERE ConversationId = @ConversationId
            ORDER BY CreatedAt ASC
            """;
        return _sql.ExecuteListAsync(sqlText, p, MapMessage);
    }

    public async Task<ChatMessage> AddMessage(int conversationId, string senderRole, int senderUserId, string body)
    {
        SqlParameter[] insert =
        [
            new("@ConversationId", conversationId),
            new("@SenderRole",     senderRole),
            new("@SenderUserId",   senderUserId),
            new("@Body",           body)
        ];

        var message = await _sql.ExecuteSingleAsync(
            """
            INSERT INTO dbo.ChatMessages (ConversationId, SenderRole, SenderUserId, Body, IsRead, CreatedAt)
            OUTPUT INSERTED.MessageId, INSERTED.ConversationId, INSERTED.SenderRole,
                   INSERTED.SenderUserId, INSERTED.Body, INSERTED.IsRead, INSERTED.CreatedAt
            VALUES (@ConversationId, @SenderRole, @SenderUserId, @Body, 0, GETDATE())
            """,
            insert, MapMessage);

        SqlParameter[] touch = [new("@ConversationId", conversationId)];
        await _sql.ExecuteNonQueryAsync(
            "UPDATE dbo.ChatConversations SET LastMessageAt = GETDATE() WHERE ConversationId = @ConversationId",
            touch);

        return message!;
    }

    // Marks messages sent by the OTHER party (relative to readerRole) as read.
    public Task MarkRead(int conversationId, string readerRole)
    {
        var otherRole = readerRole == "customer" ? "provider" : "customer";
        SqlParameter[] p = [new("@ConversationId", conversationId), new("@OtherRole", otherRole)];
        return _sql.ExecuteNonQueryAsync(
            "UPDATE dbo.ChatMessages SET IsRead = 1 WHERE ConversationId = @ConversationId AND SenderRole = @OtherRole AND IsRead = 0",
            p);
    }

    public async Task<int> GetUnreadCountForCustomer(int customerId)
    {
        SqlParameter[] p = [new("@CustomerId", customerId)];
        return await _sql.ExecuteScalarAsync<int>(
            """
            SELECT COUNT(*) FROM dbo.ChatMessages m
            INNER JOIN dbo.ChatConversations c ON c.ConversationId = m.ConversationId
            WHERE c.CustomerId = @CustomerId AND m.SenderRole = 'provider' AND m.IsRead = 0
            """, p);
    }

    public async Task<int> GetUnreadCountForProvider(int providerId)
    {
        SqlParameter[] p = [new("@ProviderId", providerId)];
        return await _sql.ExecuteScalarAsync<int>(
            """
            SELECT COUNT(*) FROM dbo.ChatMessages m
            INNER JOIN dbo.ChatConversations c ON c.ConversationId = m.ConversationId
            WHERE c.ProviderId = @ProviderId AND m.SenderRole = 'customer' AND m.IsRead = 0
            """, p);
    }

    private static ChatConversation MapConversationBasic(SqlDataReader r) => new()
    {
        ConversationId = r.GetInt32(r.GetOrdinal("ConversationId")),
        CustomerId     = r.GetInt32(r.GetOrdinal("CustomerId")),
        ProviderId     = r.GetInt32(r.GetOrdinal("ProviderId")),
        CreatedAt      = r.GetDateTime(r.GetOrdinal("CreatedAt")),
        LastMessageAt  = r.IsDBNull(r.GetOrdinal("LastMessageAt")) ? null : r.GetDateTime(r.GetOrdinal("LastMessageAt")),
    };

    private static ChatConversation MapConversationSummary(SqlDataReader r) => new()
    {
        ConversationId = r.GetInt32(r.GetOrdinal("ConversationId")),
        CustomerId     = r.GetInt32(r.GetOrdinal("CustomerId")),
        ProviderId     = r.GetInt32(r.GetOrdinal("ProviderId")),
        CreatedAt      = r.GetDateTime(r.GetOrdinal("CreatedAt")),
        LastMessageAt  = r.IsDBNull(r.GetOrdinal("LastMessageAt"))  ? null : r.GetDateTime(r.GetOrdinal("LastMessageAt")),
        OtherPartyName = r.IsDBNull(r.GetOrdinal("OtherPartyName")) ? null : r.GetString(r.GetOrdinal("OtherPartyName")),
        LastMessage    = r.IsDBNull(r.GetOrdinal("LastMessage"))    ? null : r.GetString(r.GetOrdinal("LastMessage")),
        UnreadCount    = r.GetInt32(r.GetOrdinal("UnreadCount")),
    };

    private static ChatMessage MapMessage(SqlDataReader r) => new()
    {
        MessageId      = r.GetInt32(r.GetOrdinal("MessageId")),
        ConversationId = r.GetInt32(r.GetOrdinal("ConversationId")),
        SenderRole     = r.GetString(r.GetOrdinal("SenderRole")),
        SenderUserId   = r.GetInt32(r.GetOrdinal("SenderUserId")),
        Body           = r.GetString(r.GetOrdinal("Body")),
        IsRead         = r.GetBoolean(r.GetOrdinal("IsRead")),
        CreatedAt      = r.GetDateTime(r.GetOrdinal("CreatedAt")),
    };
}
