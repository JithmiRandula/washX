namespace Laundry.Models;

public sealed class ChatConversation
{
    public int       ConversationId { get; set; }
    public int       CustomerId     { get; set; }
    public int       ProviderId     { get; set; }
    public string?   OtherPartyName { get; set; }
    public string?   LastMessage    { get; set; }
    public DateTime? LastMessageAt  { get; set; }
    public int       UnreadCount    { get; set; }
    public DateTime  CreatedAt      { get; set; }
}
