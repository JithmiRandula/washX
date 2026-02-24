require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');

console.log('🧪 Testing Cloudinary Configuration...\n');

// Test connection
cloudinary.api.ping()
  .then(result => {
    console.log('✅ SUCCESS! Cloudinary is connected and configured correctly!\n');
    console.log('📋 Configuration:');
    console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('   API Key:', process.env.CLOUDINARY_API_KEY);
    console.log('   Status:', result.status);
    console.log('\n🎉 You can now upload provider images to Cloudinary!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ ERROR: Failed to connect to Cloudinary\n');
    console.error('Error:', error.message);
    console.error('\n⚠️  Please check your credentials in .env file');
    process.exit(1);
  });
