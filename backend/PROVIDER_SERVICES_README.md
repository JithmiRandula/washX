# Provider Services Collection

## Overview

The `provider_services` collection creates a many-to-many relationship between providers and services, allowing:
- Multiple providers to offer the same service with different prices
- Each provider to customize pricing and terms for services they offer
- Flexible discount management per provider-service combination
- Independent activation/deactivation of services per provider

## Database Schema

### ProviderService Model

```javascript
{
  providerId: ObjectId,           // Reference to Provider
  serviceId: ObjectId,            // Reference to Service
  price: Number,                  // Provider's price for this service
  unit: String,                   // 'per kg', 'per piece', 'per item', 'per bundle', 'per set'
  customDescription: String,      // Optional custom description
  isActive: Boolean,              // Is this service active for this provider?
  discount: {
    percentage: Number,           // 0-100
    validUntil: Date             // Discount expiration date
  },
  estimatedDuration: String,      // e.g., "24 hours", "2-3 days"
  minOrder: {
    quantity: Number,
    unit: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Scripts

### 1. Generate Provider Services

Automatically creates provider_services documents for all existing providers and services.

```bash
# Using npm script
npm run generate:provider-services

# Or directly
node src/generateProviderServices.js
```

**Features:**
- Clears existing provider_services collection
- Links providers to a selection of available services (60% by default)
- Generates varied pricing (±20% variation from base price)
- Randomly assigns discounts (30% chance of 5-25% discount)
- Preserves service details (duration, min order, etc.)

**Customization Options:**

Edit `src/generateProviderServices.js`:

```javascript
// Link ALL services to ALL providers
for (const service of services) {
  // ... generate provider_service
}

// Or customize selection percentage
const selectedServices = shuffledServices.slice(0, Math.ceil(services.length * 0.8)); // 80%
```

### 2. Query Provider Services

Displays a comprehensive report of all provider-service relationships.

```bash
# Using npm script
npm run query:provider-services

# Or directly
node src/queryProviderServices.js
```

**Output includes:**
- Grouped listing by provider
- Service details with pricing
- Active discounts
- Statistics (average price, category distribution, etc.)

## Usage Examples

### Basic Queries

```javascript
const ProviderService = require('./models/ProviderService');

// Get all services offered by a specific provider
const providerServices = await ProviderService.find({ 
  providerId: providerId,
  isActive: true 
})
.populate('serviceId');

// Get all providers offering a specific service
const providers = await ProviderService.find({ 
  serviceId: serviceId,
  isActive: true 
})
.populate('providerId')
.sort({ price: 1 }); // Sort by price

// Get services with active discounts
const discounted = await ProviderService.find({ 
  'discount.percentage': { $gt: 0 },
  'discount.validUntil': { $gte: new Date() }
})
.populate('providerId serviceId');

// Get cheapest provider for a service
const cheapest = await ProviderService.findOne({ 
  serviceId: serviceId,
  isActive: true 
})
.sort({ price: 1 })
.populate('providerId');
```

### API Endpoints (Example)

```javascript
// GET /api/providers/:providerId/services
// Get all services offered by a provider
router.get('/providers/:providerId/services', async (req, res) => {
  const services = await ProviderService.find({ 
    providerId: req.params.providerId,
    isActive: true 
  })
  .populate('serviceId');
  res.json({ success: true, data: services });
});

// GET /api/services/:serviceId/providers
// Get all providers offering a specific service
router.get('/services/:serviceId/providers', async (req, res) => {
  const providers = await ProviderService.find({ 
    serviceId: req.params.serviceId,
    isActive: true 
  })
  .populate('providerId')
  .sort({ price: 1 });
  res.json({ success: true, data: providers });
});

// POST /api/provider-services
// Create a new provider-service link
router.post('/provider-services', async (req, res) => {
  const providerService = await ProviderService.create(req.body);
  res.json({ success: true, data: providerService });
});

// PUT /api/provider-services/:id
// Update pricing or discount
router.put('/provider-services/:id', async (req, res) => {
  const providerService = await ProviderService.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json({ success: true, data: providerService });
});
```

## Benefits

1. **Flexibility**: Each provider can set their own prices for services
2. **Competition**: Customers can compare prices across providers
3. **Discounts**: Time-limited promotional pricing per provider
4. **Independence**: Enable/disable services without affecting others
5. **Scalability**: Easy to add new providers or services

## Migration from Old Structure

If you were using the direct `services` array in Provider model:

```javascript
// Old structure
Provider {
  services: [serviceId1, serviceId2, ...]
}

// New structure
ProviderService {
  providerId: providerId,
  serviceId: serviceId1,
  price: 9.99,
  ...
}
```

## Maintenance

### Re-generate Provider Services

If you add new providers or services, re-run the generation script:

```bash
npm run generate:provider-services
```

This will clear and regenerate all provider-service links.

### View Current State

Check the current database state anytime:

```bash
npm run query:provider-services
```

## Files Created

1. `backend/src/models/ProviderService.js` - Mongoose model
2. `backend/src/generateProviderServices.js` - Generation script
3. `backend/src/queryProviderServices.js` - Query/reporting script
4. This README file

## Notes

- The script generates randomized pricing variations to simulate real-world scenarios
- Discounts are randomly applied to 30% of services by default
- Unique compound index on (providerId, serviceId) prevents duplicates
- All provider-service links are active by default (isActive: true)
