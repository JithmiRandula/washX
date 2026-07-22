namespace Laundry.Models;

public sealed class BulkRequest
{
    public int      BulkRequestId     { get; set; }
    public string   RequestReference  { get; set; } = string.Empty;
    public int      CustomerId        { get; set; }
    public int      ProviderId        { get; set; }
    public int      ServiceId         { get; set; }

    public string   FulfillmentMethod { get; set; } = "pickup"; // "pickup" | "dropoff"
    public string?  Address           { get; set; }
    public DateTime? PreferredDate    { get; set; }
    public string?  PreferredSlot     { get; set; }
    public string?  Notes             { get; set; }

    public string   Status            { get; set; } = "pending_request";

    public decimal  PricePerKg        { get; set; }
    public decimal? ActualWeightKg    { get; set; }
    public decimal? FinalPrice        { get; set; }

    public string?  PaymentProvider   { get; set; }
    public string?  PaymentStatus     { get; set; }

    public DateTime? CreatedAt        { get; set; }
    public DateTime? AcceptedAt       { get; set; }
    public DateTime? ReceivedAt       { get; set; }
    public DateTime? WeighedAt        { get; set; }
    public DateTime? ConfirmedAt      { get; set; }
    public DateTime? PaidAt           { get; set; }
    public DateTime? ProcessingAt     { get; set; }
    public DateTime? ReadyAt          { get; set; }
    public DateTime? CompletedAt      { get; set; }
    public DateTime? CancelledAt      { get; set; }

    // Populated by joined list/detail queries
    public string?  ServiceName       { get; set; }
    public string?  ServiceDescription{ get; set; }
    public string?  ProviderName      { get; set; }
    public string?  CustomerName      { get; set; }
    public string?  CustomerPhone     { get; set; }
}
