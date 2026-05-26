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
}
