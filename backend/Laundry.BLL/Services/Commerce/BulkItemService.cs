using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Commerce;

public sealed class BulkItemService(BulkItemRepository repository)
{
    private readonly BulkItemRepository _repo = repository;

    public Task AddBulkItem(BulkItem item)
    {
        if (item.ServiceId <= 0) throw new ArgumentException("ServiceId is required");
        if (string.IsNullOrWhiteSpace(item.Name)) throw new ArgumentException("Name is required");
        if (item.IncludedCount <= 0) throw new ArgumentException("IncludedCount must be at least 1");

        return _repo.AddBulkItem(item.ServiceId, item.Name, item.IncludedCount, item.MaxWeightKg, item.Price, item.ImageUrl, item.Description);
    }

    public Task<List<BulkItem>> GetBulkItems(int serviceId) => _repo.GetBulkItems(serviceId);

    public Task<List<BulkItem>> GetProviderBulkItems(int serviceId) => _repo.GetProviderBulkItems(serviceId);

    public Task UpdateBulkItem(int bulkItemId, BulkItem item)
    {
        if (bulkItemId <= 0) throw new ArgumentException("Invalid BulkItemId");
        if (item.ServiceId <= 0) throw new ArgumentException("ServiceId is required");
        if (string.IsNullOrWhiteSpace(item.Name)) throw new ArgumentException("Name is required");
        if (item.IncludedCount <= 0) throw new ArgumentException("IncludedCount must be at least 1");

        return _repo.UpdateBulkItem(bulkItemId, item.ServiceId, item.Name, item.IncludedCount, item.MaxWeightKg, item.Price, item.ImageUrl, item.Description);
    }

    public Task DeleteBulkItem(int bulkItemId) => _repo.DeleteBulkItem(bulkItemId);

    public Task RestoreBulkItem(int bulkItemId) => _repo.RestoreBulkItem(bulkItemId);
}
