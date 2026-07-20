namespace Laundry.Models;

public sealed class ChatMessage
{
    public int      MessageId      { get; set; }
    public int      ConversationId { get; set; }
    public string   SenderRole     { get; set; } = string.Empty; // "customer" | "provider"
    public int      SenderUserId   { get; set; }
    public string   Body           { get; set; } = string.Empty;
    public bool     IsRead         { get; set; }
    public DateTime CreatedAt      { get; set; }
}
