namespace Laundry.Models;

public sealed class AdminUser
{
    public int       UserId      { get; set; }
    public string    Name        { get; set; } = string.Empty;
    public string    Email       { get; set; } = string.Empty;
    public string    Phone       { get; set; } = string.Empty;
    public string    Role        { get; set; } = string.Empty;
    public DateTime? CreatedAt   { get; set; }
    public int       TotalOrders { get; set; }
    public decimal   TotalSpent  { get; set; }
    public string?   Address     { get; set; }
}
