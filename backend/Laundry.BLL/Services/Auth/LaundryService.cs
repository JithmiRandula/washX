using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Auth;

public sealed class LaundryService(ServiceRepository repository)
{
    private readonly ServiceRepository _repository = repository;

    public Task<int?> GetProviderIdForService(int serviceId)
    {
        return _repository.GetProviderIdForService(serviceId);
    }

    public Task AddService(int providerId, Service service)
    {
        return _repository.AddService(providerId, service);
    }

    public Task<List<Service>> GetAllServices()
    {
        return _repository.GetAllServices();
    }

    public Task<List<Service>> GetServicesByProviderId(int providerId)
    {
        return _repository.GetServicesByProviderId(providerId);
    }

    public Task<int> UpdateService(int serviceId, int providerId, Service service)
    {
        _ = providerId;
        return _repository.UpdateService(serviceId, service);
    }

    public Task<int> DeleteService(int serviceId)
    {
        return _repository.DeleteService(serviceId);
    }
}