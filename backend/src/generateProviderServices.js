const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Provider = require('./models/Provider');
const Service = require('./models/Service');
const ProviderService = require('./models/ProviderService');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Generate Provider Services
const generateProviderServices = async () => {
  try {
    console.log('🚀 Starting Provider Services Generation...\n');

    // Clear existing provider_services collection
    console.log('🗑️  Clearing existing provider_services...');
    const deleteResult = await ProviderService.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing records\n`);

    // Get all active providers
    console.log('📋 Fetching providers...');
    const providers = await Provider.find({ isActive: true }).select('_id businessName');
    console.log(`   Found ${providers.length} active providers\n`);

    // Get all active services
    console.log('📋 Fetching services...');
    const services = await Service.find({ active: true }).select('_id name category prices duration minOrder');
    console.log(`   Found ${services.length} active services\n`);

    if (providers.length === 0 || services.length === 0) {
      console.log('⚠️  No providers or services found. Please seed your database first.');
      return;
    }

    // Generate provider_services documents
    console.log('⚙️  Generating provider_services documents...\n');
    const providerServices = [];
    let count = 0;

    for (const provider of providers) {
      // Each provider will offer a selection of services
      // You can customize this logic based on your business rules
      
      // Option 1: Link ALL services to ALL providers (uncomment if desired)
      // for (const service of services) {
      
      // Option 2: Random selection (each provider gets 60% of available services)
      const shuffledServices = services.sort(() => 0.5 - Math.random());
      const selectedServices = shuffledServices.slice(0, Math.ceil(services.length * 0.6));
      
      for (const service of selectedServices) {
        // Get the first price from the service or generate a random price
        const basePrice = service.prices && service.prices.length > 0 
          ? service.prices[0].price 
          : Math.floor(Math.random() * 20) + 5; // Random price between 5-25

        const baseUnit = service.prices && service.prices.length > 0
          ? service.prices[0].unit
          : 'per piece';

        // Add some price variation between providers (±20%)
        const priceVariation = (Math.random() * 0.4) - 0.2; // -20% to +20%
        const finalPrice = parseFloat((basePrice * (1 + priceVariation)).toFixed(2));

        // Parse minOrder from service
        let minOrderQuantity = 1;
        let minOrderUnit = 'piece';
        if (service.minOrder) {
          const minOrderMatch = service.minOrder.match(/(\d+)\s*(\w+)/);
          if (minOrderMatch) {
            minOrderQuantity = parseInt(minOrderMatch[1]);
            minOrderUnit = minOrderMatch[2];
          }
        }

        // Create provider_service document
        const providerService = {
          providerId: provider._id,
          serviceId: service._id,
          price: finalPrice,
          unit: baseUnit,
          customDescription: '', // Can be customized per provider
          isActive: true,
          discount: {
            percentage: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0, // 30% chance of 5-25% discount
            validUntil: Math.random() > 0.7 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null // 30 days from now
          },
          estimatedDuration: service.duration || '24 hours',
          minOrder: {
            quantity: minOrderQuantity,
            unit: minOrderUnit
          }
        };

        providerServices.push(providerService);
        count++;

        // Log progress
        console.log(`   ✓ ${provider.businessName} → ${service.name}`);
        console.log(`     Price: $${finalPrice} ${baseUnit}, Min: ${minOrderQuantity} ${minOrderUnit}`);
        if (providerService.discount.percentage > 0) {
          console.log(`     💰 Discount: ${providerService.discount.percentage}% off`);
        }
      }
      console.log(''); // Empty line between providers
    }

    // Bulk insert provider_services
    console.log('\n💾 Saving provider_services to database...');
    const result = await ProviderService.insertMany(providerServices);
    console.log(`✅ Successfully created ${result.length} provider_service documents\n`);

    // Display summary
    console.log('📊 SUMMARY:');
    console.log('━'.repeat(50));
    console.log(`   Providers: ${providers.length}`);
    console.log(`   Services: ${services.length}`);
    console.log(`   Provider-Service Links: ${result.length}`);
    console.log(`   Average Services per Provider: ${Math.round(result.length / providers.length)}`);
    console.log('━'.repeat(50));

    // Display sample data
    console.log('\n📝 Sample Provider-Service Records:\n');
    const sampleRecords = await ProviderService.find()
      .populate('providerId', 'businessName')
      .populate('serviceId', 'name category')
      .limit(5);

    sampleRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.providerId.businessName} offers ${record.serviceId.name}`);
      console.log(`   Category: ${record.serviceId.category}`);
      console.log(`   Price: $${record.price} ${record.unit}`);
      console.log(`   Min Order: ${record.minOrder.quantity} ${record.minOrder.unit}`);
      console.log(`   Duration: ${record.estimatedDuration}`);
      if (record.discount.percentage > 0) {
        console.log(`   💰 Discount: ${record.discount.percentage}% (valid until ${record.discount.validUntil?.toLocaleDateString()})`);
      }
      console.log('');
    });

    console.log('✨ Provider Services Generation Complete!\n');

  } catch (error) {
    console.error('❌ Error generating provider services:', error.message);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await generateProviderServices();
    console.log('👋 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

// Run the script
main();
