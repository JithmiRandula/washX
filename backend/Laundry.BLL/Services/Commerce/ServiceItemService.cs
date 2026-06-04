using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Commerce;

public sealed class ServiceItemService(ServiceItemRepository repository)
{
    private readonly ServiceItemRepository _repository = repository;

    public Task AddServiceItem(ServiceItem item)
    {
        ValidateItem(item);
        return _repository.AddServiceItem(
            item.ServiceId,
            item.ItemName.Trim(),
            item.Description,
            item.Price,
            item.ImageUrl);
    }

    public Task<List<ServiceItem>> GetServiceItems(int serviceId)
    {
        if (serviceId <= 0)
            throw new ArgumentException("Invalid service id");

        return _repository.GetServiceItems(serviceId);
    }

    public Task UpdateServiceItem(int itemId, ServiceItem item)
    {
        if (itemId <= 0)
            throw new ArgumentException("Invalid item id");

        ValidateItem(item);
        return _repository.UpdateServiceItem(
            itemId,
            item.ServiceId,
            item.ItemName.Trim(),
            item.Description,
            item.Price,
            item.ImageUrl);
    }

    public Task DeleteServiceItem(int itemId, int serviceId)
    {
        if (itemId <= 0 || serviceId <= 0)
            throw new ArgumentException("Invalid item or service id");

        return _repository.DeleteServiceItem(itemId, serviceId);
    }

    private static void ValidateItem(ServiceItem item)
    {
        if (item.ServiceId <= 0)
            throw new ArgumentException("ServiceId is required");

        if (string.IsNullOrWhiteSpace(item.ItemName))
            throw new ArgumentException("Item name is required");

        if (item.Price <= 0)
            throw new ArgumentException("Price must be greater than zero");
    }
}
