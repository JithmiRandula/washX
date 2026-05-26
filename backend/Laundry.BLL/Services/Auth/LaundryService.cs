using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Auth;

public sealed class LaundryService(ServiceRepository repository)
{
    private readonly ServiceRepository _repository = repository;

    public Task AddService(Service service)
    {
        return _repository.AddService(service);
    }

    public Task<List<Service>> GetAllServices()
    {
        return _repository.GetAllServices();
    }

    public Task<int> UpdateService(int serviceId, Service service)
    {
        return _repository.UpdateService(serviceId, service);
    }

    public Task<int> DeleteService(int serviceId)
    {
        return _repository.DeleteService(serviceId);
    }
}