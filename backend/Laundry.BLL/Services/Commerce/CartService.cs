using Laundry.DAL.Repositories;

namespace Laundry.BLL.Services.Commerce;

public sealed class CartService(CartRepository cartRepository, UserRepository userRepository)
{
    private readonly CartRepository _cartRepository = cartRepository;
    private readonly UserRepository _userRepository = userRepository;

    public async Task<int> ResolveCustomerIdAsync(int userId)
    {
        var customerId = await _userRepository.GetCustomerIdByUserId(userId);
        if (customerId is null || customerId <= 0)
            throw new ArgumentException("Customer profile not found");

        return customerId.Value;
    }

    public async Task<List<Models.CartItemDetail>> GetCartItemsAsync(int userId)
    {
        var customerId = await ResolveCustomerIdAsync(userId);
        return await _cartRepository.GetCartItems(customerId);
    }

    public async Task AddToCartAsync(int userId, int providerId, int itemId, int quantity)
    {
        if (providerId <= 0 || itemId <= 0)
            throw new ArgumentException("Invalid provider or item");

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be at least 1");

        var customerId = await ResolveCustomerIdAsync(userId);

        for (var i = 0; i < quantity; i++)
            await _cartRepository.AddToCart(customerId, providerId, itemId);
    }

    public async Task IncreaseQuantityAsync(int userId, int cartItemId)
    {
        if (cartItemId <= 0)
            throw new ArgumentException("Invalid cart item");

        await ResolveCustomerIdAsync(userId);
        await _cartRepository.IncreaseCartQuantity(cartItemId);
    }

    public async Task DecreaseQuantityAsync(int userId, int cartItemId)
    {
        if (cartItemId <= 0)
            throw new ArgumentException("Invalid cart item");

        var customerId = await ResolveCustomerIdAsync(userId);
        var items = await _cartRepository.GetCartItems(customerId);
        var row = items.FirstOrDefault(x => x.CartItemId == cartItemId);

        if (row is null)
            throw new ArgumentException("Cart item not found");

        if (row.Quantity <= 1)
            await _cartRepository.DeleteCartItem(cartItemId, customerId);
        else
            await _cartRepository.DecreaseCartQuantity(cartItemId);
    }

    public async Task RemoveItemAsync(int userId, int cartItemId)
    {
        if (cartItemId <= 0)
            throw new ArgumentException("Invalid cart item");

        var customerId = await ResolveCustomerIdAsync(userId);
        await _cartRepository.DeleteCartItem(cartItemId, customerId);
    }

    public async Task ClearCartAsync(int userId)
    {
        var customerId = await ResolveCustomerIdAsync(userId);
        await _cartRepository.ClearCartByCustomer(customerId);
    }
}
