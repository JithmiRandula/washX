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
                await _repo.AddOrderItem(orderId, item);
            }
        }

        return orderId;
    }

    public Task<Order?> GetOrder(int orderId) => _repo.GetOrderById(orderId);
}
