using System;
using System.Collections.Generic;
using System.Text;

namespace Laundry.Models
{
    public class Customer
    {
        public int CustomerId { get; set; }

        public int UserId { get; set; }

        public string? Address { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public int LoyaltyPoints { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
