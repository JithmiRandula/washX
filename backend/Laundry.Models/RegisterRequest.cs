using System;
using System.Collections.Generic;
using System.Text;

namespace Laundry.Models
{
    public class RegisterRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
    }
}
