using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Laundry.Models
{
    public class Service
    {
        public int ServiceId { get; set; }

        public int ProviderId { get; set; }

        public string? ProviderBusinessName { get; set; }

        public required string ServiceName { get; set; }

        public required string Category { get; set; }

        public required string PricingType { get; set; }

        public decimal Price { get; set; }

        public int MinimumOrder { get; set; }

        public string? TurnaroundTime { get; set; }

        public string? Description { get; set; }

        public string? KeyFeatures { get; set; }

        public string? SpecialInstructions { get; set; }
    }
}