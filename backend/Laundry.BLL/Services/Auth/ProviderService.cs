using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Auth;

public sealed class ProviderService(ProviderRepository repository)
{
    private readonly ProviderRepository _repository = repository;

    public Task<ProviderProfile?> GetProviderProfile(int providerId)
    {
        return _repository.GetProviderProfile(providerId);
    }

    public Task<List<ProviderWithServices>> GetProvidersWithServices()
    {
        return _repository.GetProvidersWithServices();
    }

    public Task<ProviderWithServices?> GetProviderWithServices(int providerId)
    {
        return _repository.GetProviderWithServices(providerId);
    }

    public Task UpdateDeliverySettings(int providerId, bool offersDelivery, decimal deliveryFee)
    {
        return _repository.UpdateDeliverySettings(providerId, offersDelivery, deliveryFee);
    }
}
