namespace Laundry.API.Contracts.Payments;

public sealed class PayHereCheckoutRequest
{
    public decimal Amount { get; set; }
    public string? Items { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
}
