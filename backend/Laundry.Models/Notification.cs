namespace Laundry.Models;

public sealed class Notification
{
    public int      NotificationId { get; set; }
    public int      ProviderId     { get; set; }
    public int?     OrderId        { get; set; }
    public string?  OrderReference { get; set; }
    public string?  CustomerName   { get; set; }
    public string   Title          { get; set; } = string.Empty;
    public string   Message        { get; set; } = string.Empty;
    public bool     IsRead         { get; set; }
    public DateTime CreatedAt      { get; set; }
}
