using System;
using System.Collections.Generic;
using System.Text;

namespace Laundry.Models
{
    public class Provider
    {
        public int ProviderId { get; set; }

        public int UserId { get; set; }

        public string BusinessName { get; set; } = string.Empty;

        public string? BusinessAddress { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public string? Description { get; set; }

        public decimal Rating { get; set; }

        public bool IsVerified { get; set; }

        public bool OffersDelivery { get; set; }

        public decimal DeliveryFee { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
