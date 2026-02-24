require('dotenv').config();
const mongoose = require('mongoose');
const Provider = require('./src/models/Provider');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  const providers = await Provider.find({});
  console.log('\nTotal providers in database:', providers.length);
  console.log('\nProviders:');
  providers.forEach(p => {
    console.log(`  - ${p.businessName}`);
    console.log(`    Email: ${p.email}`);
    console.log(`    isActive: ${p.isActive}`);
    console.log(`    isVerified: ${p.isVerified}`);
    console.log('');
  });
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
