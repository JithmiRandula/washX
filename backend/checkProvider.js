const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Provider = require('./src/models/Provider');

const checkProvider = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const provider = await Provider.findOne({ businessName: 'Dinusha Herath' });
    
    if (provider) {
      console.log('\n📦 Provider found:');
      console.log('Name:', provider.businessName);
      console.log('ID:', provider._id);
      console.log('Images array:', provider.images);
      console.log('Images count:', provider.images?.length || 0);
      
      if (provider.images && provider.images.length > 0) {
        console.log('\n🖼️ First image:', provider.images[0]);
      } else {
        console.log('\n⚠️ No images found in database!');
      }
    } else {
      console.log('❌ Provider "Dinusha Herath" not found');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProvider();
