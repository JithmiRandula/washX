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

    public Task UpdateImageUrl(int providerId, string imageUrl)
    {
        return _repository.UpdateImageUrl(providerId, imageUrl);
    }

    public Task UpdateProfile(
        int providerId, string businessName, string? description, string? businessLicense,
        string? businessAddress, string? city, string? state, string? zipCode,
        decimal? latitude, decimal? longitude, string? operatingHours)
    {
        return _repository.UpdateProfile(
            providerId, businessName, description, businessLicense,
            businessAddress, city, state, zipCode, latitude, longitude, operatingHours);
    }
}
