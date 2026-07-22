using Laundry.DAL.Repositories;
using Laundry.Models;

namespace Laundry.BLL.Services.Commerce;

public sealed class BulkRequestService(BulkRequestRepository repo, NotificationRepository notifications)
{
    private readonly BulkRequestRepository _repo = repo;
    private readonly NotificationRepository _notifications = notifications;

    public async Task<(bool Success, string? Error, int? BulkRequestId)> Create(
        int customerId, int serviceId, string fulfillmentMethod, string? address,
        DateTime? preferredDate, string? preferredSlot, string? notes)
    {
        var method = fulfillmentMethod?.Trim().ToLowerInvariant();
        if (method != "pickup" && method != "dropoff")
            return (false, "fulfillmentMethod must be 'pickup' or 'dropoff'", null);

        if (method == "pickup" && string.IsNullOrWhiteSpace(address))
            return (false, "Address is required for pickup requests", null);

        var service = await _repo.GetServiceForBulkRequest(serviceId);
        if (service is null)
            return (false, "This service is not a per-kg bulk service", null);
        if (!service.Value.IsActive)
            return (false, "This service is not currently active", null);

        var reference = $"WASHXBULK-{customerId}-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";

        var bulkRequestId = await _repo.Create(new BulkRequest
        {
            RequestReference  = reference,
            CustomerId        = customerId,
            ProviderId        = service.Value.ProviderId,
            ServiceId         = serviceId,
            FulfillmentMethod = method,
            Address           = method == "pickup" ? address!.Trim() : null,
            PreferredDate     = preferredDate,
            PreferredSlot     = string.IsNullOrWhiteSpace(preferredSlot) ? null : preferredSlot.Trim(),
            Notes             = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim(),
            PricePerKg        = service.Value.PricePerKg,
        });

        return (true, null, bulkRequestId);
    }

    public Task<BulkRequest?> GetById(int id) => _repo.GetById(id);

    public Task<List<BulkRequest>> GetForCustomer(int customerId) => _repo.GetByCustomer(customerId);

    public Task<List<BulkRequest>> GetForProvider(int providerId) => _repo.GetByProvider(providerId);

    // ── Provider actions ─────────────────────────────────────────────────
    public async Task<bool> Accept(int id, int providerId)
    {
        var req = await _repo.GetById(id);
        if (req is null || req.ProviderId != providerId) return false;

        var nextStatus = req.FulfillmentMethod == "pickup" ? "pickup_scheduled" : "awaiting_dropoff";
        var affected = await _repo.Accept(id, providerId, nextStatus);
        return affected > 0;
    }

    public async Task<bool> Reject(int id, int providerId) =>
        await _repo.Reject(id, providerId) > 0;

    public async Task<bool> MarkReceived(int id, int providerId) =>
        await _repo.MarkReceived(id, providerId) > 0;

    public async Task<(bool Success, string? Error)> ConfirmWeight(int id, int providerId, decimal actualWeightKg)
    {
        if (actualWeightKg <= 0) return (false, "Weight must be greater than zero");

        var req = await _repo.GetById(id);
        if (req is null || req.ProviderId != providerId) return (false, "Bulk request not found");

        var finalPrice = Math.Round(actualWeightKg * req.PricePerKg, 2);
        var affected = await _repo.ConfirmWeight(id, providerId, actualWeightKg, finalPrice);
        if (affected == 0) return (false, "Bulk request is not awaiting weighing");

        try
        {
            await _notifications.AddCustomerNotification(
                req.CustomerId, providerId, null, req.RequestReference,
                "Laundry Weighed — Confirm to Continue",
                $"Your laundry for {req.RequestReference} weighed {actualWeightKg:0.##} kg. " +
                $"Final price: Rs {finalPrice:0.00}. Please confirm to proceed with payment.");
        }
        catch { /* notification failure must never break the weigh-in */ }

        return (true, null);
    }

    public async Task<bool> StartProcessing(int id, int providerId) =>
        await _repo.StartProcessing(id, providerId) > 0;

    public async Task<bool> MarkReady(int id, int providerId) =>
        await _repo.MarkReady(id, providerId) > 0;

    public async Task<bool> Complete(int id, int providerId) =>
        await _repo.Complete(id, providerId) > 0;

    // ── Customer actions ─────────────────────────────────────────────────
    public async Task<bool> CustomerConfirm(int id, int customerId) =>
        await _repo.CustomerConfirm(id, customerId) > 0;

    public async Task<bool> MarkPaid(int id, int customerId, string paymentProvider) =>
        await _repo.MarkPaid(id, customerId, paymentProvider) > 0;

    public async Task<bool> CustomerCancel(int id, int customerId) =>
        await _repo.CustomerCancel(id, customerId) > 0;
}
