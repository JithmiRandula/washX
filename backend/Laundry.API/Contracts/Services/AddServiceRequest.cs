namespace Laundry.API.Contracts.Services;

public sealed record AddServiceRequest(
    string ServiceName,
    string Category,
    string PricingType,
    decimal Price,
    int MinimumOrder,
    string? TurnaroundTime,
    string? Description,
    string? KeyFeatures,
    string? SpecialInstructions
);
