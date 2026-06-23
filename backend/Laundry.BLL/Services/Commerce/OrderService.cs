using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Commerce;

public sealed class OrderService(OrderRepository repository)
{
    private readonly OrderRepository _repo = repository;

    public async Task<int> CreateOrder(Order order)
    {
        if (order is null) throw new ArgumentNullException(nameof(order));

        var orderId = await _repo.AddOrder(order);
        if (order.Items is { Count: > 0 })
        {
            foreach (var item in order.Items)
            {
                item.Status ??= "pending";
                await _repo.AddOrderItem(orderId, item);
            }
        }

        return orderId;
    }

    public Task<Order?> GetOrder(int orderId) => _repo.GetOrderById(orderId);

    public Task<List<Order>> GetOrdersByCustomer(int customerId) =>
        _repo.GetOrdersByCustomer(customerId);

    public Task<List<Order>> GetOrdersByProvider(int providerId) =>
        _repo.GetOrdersByProvider(providerId);

    public async Task<bool> UpdateOrderItemStatus(int orderItemId, string status, int providerId)
    {
        var owner = await _repo.GetOrderItemProviderId(orderItemId);
        if (!owner.HasValue || owner.Value != providerId) return false;

        var affected = await _repo.UpdateOrderItemStatus(orderItemId, status);
        return affected > 0;
    }
}
