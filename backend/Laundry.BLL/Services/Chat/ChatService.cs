using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Chat;

public sealed class ChatService(ChatRepository repo)
{
    private readonly ChatRepository _repo = repo;

    public Task<List<ChatConversation>> GetConversations(string role, int id) =>
        role == "customer" ? _repo.GetForCustomer(id) : _repo.GetForProvider(id);

    public Task<int> StartConversation(int customerId, int providerId) =>
        _repo.GetOrCreateConversation(customerId, providerId);

    // Returns null when the conversation doesn't exist or doesn't belong to this caller.
    public async Task<List<ChatMessage>?> GetMessages(int conversationId, string role, int id)
    {
        var convo = await _repo.GetConversationById(conversationId);
        if (convo is null || !BelongsTo(convo, role, id)) return null;

        await _repo.MarkRead(conversationId, role);
        return await _repo.GetMessages(conversationId);
    }

    public async Task<ChatMessage?> SendMessage(int conversationId, string role, int id, int senderUserId, string? body)
    {
        if (string.IsNullOrWhiteSpace(body)) return null;
        if (body.Length > 2000) body = body[..2000];

        var convo = await _repo.GetConversationById(conversationId);
        if (convo is null || !BelongsTo(convo, role, id)) return null;

        return await _repo.AddMessage(conversationId, role, senderUserId, body.Trim());
    }

    public async Task<bool> MarkRead(int conversationId, string role, int id)
    {
        var convo = await _repo.GetConversationById(conversationId);
        if (convo is null || !BelongsTo(convo, role, id)) return false;

        await _repo.MarkRead(conversationId, role);
        return true;
    }

    public Task<int> GetUnreadCount(string role, int id) =>
        role == "customer" ? _repo.GetUnreadCountForCustomer(id) : _repo.GetUnreadCountForProvider(id);

    private static bool BelongsTo(ChatConversation c, string role, int id) =>
        role == "customer" ? c.CustomerId == id : c.ProviderId == id;
}
