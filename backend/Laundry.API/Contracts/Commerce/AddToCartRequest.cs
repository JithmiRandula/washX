namespace Laundry.API.Contracts.Commerce;

public sealed class AddToCartRequest
{
    public int ProviderId { get; set; }
    public int ItemId { get; set; }
    public int Quantity { get; set; } = 1;
}
