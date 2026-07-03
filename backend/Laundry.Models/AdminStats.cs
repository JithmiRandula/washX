namespace Laundry.Models;

public sealed class AdminStats
{
    public int     TotalUsers      { get; set; }
    public int     TotalCustomers  { get; set; }
    public int     TotalProviders  { get; set; }
    public int     TotalOrders     { get; set; }
    public int     PendingOrders   { get; set; }
    public int     ActiveOrders    { get; set; }
    public int     CompletedOrders { get; set; }
    public int     CancelledOrders { get; set; }
    public decimal TotalRevenue    { get; set; }
    public decimal MonthlyRevenue  { get; set; }
    public int     TotalReviews    { get; set; }
}
