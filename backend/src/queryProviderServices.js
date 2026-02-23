const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const ProviderService = require('./models/ProviderService');
const Provider = require('./models/Provider');
const Service = require('./models/Service');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Query Provider Services
const queryProviderServices = async () => {
  try {
    console.log('📊 PROVIDER SERVICES DATABASE REPORT\n');
    console.log('='.repeat(70));

    // Get all provider services with populated data
    const providerServices = await ProviderService.find()
      .populate('providerId', 'businessName address.city phone')
      .populate('serviceId', 'name category description')
      .sort({ 'providerId': 1, price: -1 });

    console.log(`\n📦 Total Records: ${providerServices.length}\n`);

    // Group by provider
    const groupedByProvider = {};
    providerServices.forEach(ps => {
      const providerName = ps.providerId.businessName;
      if (!groupedByProvider[providerName]) {
        groupedByProvider[providerName] = [];
      }
      groupedByProvider[providerName].push(ps);
    });

    // Display each provider's services
    Object.keys(groupedByProvider).forEach((providerName, index) => {
      const services = groupedByProvider[providerName];
      const provider = services[0].providerId;
      
      console.log(`\n${'━'.repeat(70)}`);
      console.log(`${index + 1}. ${providerName.toUpperCase()}`);
      console.log(`   📍 ${provider.address.city} | 📞 ${provider.phone}`);
      console.log(`${'━'.repeat(70)}`);
      
      services.forEach((ps, idx) => {
        console.log(`\n   ${idx + 1}. ${ps.serviceId.name}`);
        console.log(`      Category: ${ps.serviceId.category}`);
        console.log(`      Price: $${ps.price} ${ps.unit}`);
        console.log(`      Min Order: ${ps.minOrder.quantity} ${ps.minOrder.unit}`);
        console.log(`      Duration: ${ps.estimatedDuration}`);
        console.log(`      Status: ${ps.isActive ? '✅ Active' : '❌ Inactive'}`);
        
        if (ps.discount.percentage > 0) {
          const validUntil = ps.discount.validUntil 
            ? new Date(ps.discount.validUntil).toLocaleDateString() 
            : 'No expiration';
          console.log(`      💰 Discount: ${ps.discount.percentage}% off (valid until ${validUntil})`);
        }
      });
    });

    // Statistics
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('📈 STATISTICS\n');
    
    const totalProviders = Object.keys(groupedByProvider).length;
    const avgServicesPerProvider = (providerServices.length / totalProviders).toFixed(1);
    const activeServices = providerServices.filter(ps => ps.isActive).length;
    const withDiscounts = providerServices.filter(ps => ps.discount.percentage > 0).length;
    
    const prices = providerServices.map(ps => ps.price);
    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    const minPrice = Math.min(...prices).toFixed(2);
    const maxPrice = Math.max(...prices).toFixed(2);
    
    console.log(`   Total Providers: ${totalProviders}`);
    console.log(`   Total Services: ${providerServices.length}`);
    console.log(`   Average Services per Provider: ${avgServicesPerProvider}`);
    console.log(`   Active Services: ${activeServices}`);
    console.log(`   Services with Discounts: ${withDiscounts} (${((withDiscounts/providerServices.length)*100).toFixed(1)}%)`);
    console.log(`\n   Price Range: $${minPrice} - $${maxPrice}`);
    console.log(`   Average Price: $${avgPrice}`);
    
    // Group by category
    console.log(`\n   Services by Category:`);
    const categories = {};
    providerServices.forEach(ps => {
      const cat = ps.serviceId.category;
      categories[cat] = (categories[cat] || 0) + 1;
    });
    Object.keys(categories).sort().forEach(cat => {
      console.log(`      ${cat}: ${categories[cat]}`);
    });
    
    console.log(`\n${'='.repeat(70)}\n`);

  } catch (error) {
    console.error('❌ Error querying provider services:', error.message);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await queryProviderServices();
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
