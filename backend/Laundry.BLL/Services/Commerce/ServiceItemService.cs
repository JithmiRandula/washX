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
            item.ServiceTypeId,
            item.ItemName.Trim(),
            item.Description,
            item.Price,
            item.ImageUrl);
    }

    public Task<List<ServiceItem>> GetServiceItems(int serviceTypeId)
    {
        if (serviceTypeId <= 0)
            throw new ArgumentException("Invalid service type id");

        return _repository.GetServiceItems(serviceTypeId);
    }

    public Task UpdateServiceItem(int itemId, ServiceItem item)
    {
        if (itemId <= 0)
            throw new ArgumentException("Invalid item id");

        ValidateItem(item);
        return _repository.UpdateServiceItem(
            itemId,
            item.ServiceTypeId,
            item.ItemName.Trim(),
            item.Description,
            item.Price,
            item.ImageUrl);
    }

    public Task DeleteServiceItem(int itemId, int serviceTypeId)
    {
        if (itemId <= 0 || serviceTypeId <= 0)
            throw new ArgumentException("Invalid item or service type id");

        return _repository.DeleteServiceItem(itemId, serviceTypeId);
    }

    private static void ValidateItem(ServiceItem item)
    {
        if (item.ServiceTypeId <= 0)
            throw new ArgumentException("ServiceTypeId is required");

        if (string.IsNullOrWhiteSpace(item.ItemName))
            throw new ArgumentException("Item name is required");

        if (item.Price <= 0)
            throw new ArgumentException("Price must be greater than zero");
    }
}
