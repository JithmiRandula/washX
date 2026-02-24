require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testProviderRegistration() {
  try {
    console.log('🧪 Testing Provider Registration Flow\n');
    
    // Test data
    const providerData = {
      name: 'Test Laundry Service',
      email: 'testprovider@washx.com',
      password: 'test123456',
      phone: '+1234567899',
      role: 'provider',
      address: '123 Test Street'
    };
    
    console.log('📝 Registering new provider...');
    console.log('   Name:', providerData.name);
    console.log('   Email:', providerData.email);
    console.log('   Role:', providerData.role);
    
    const registerResponse = await axios.post(`${API_URL}/auth/register`, providerData);
    
    if (registerResponse.data.success) {
      console.log('\n✅ Provider registered successfully!');
      console.log('   User ID:', registerResponse.data.user.id);
      console.log('   Provider ID:', registerResponse.data.providerId);
      
      // Fetch all providers
      console.log('\n🔍 Fetching all providers...');
      const providersResponse = await axios.get(`${API_URL}/providers`);
      
      console.log('\n📊 Total providers in database:', providersResponse.data.count);
      console.log('\nProviders list:');
      providersResponse.data.data.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.businessName} (${p.email})`);
        console.log(`      isActive: ${p.isActive}, isVerified: ${p.isVerified}`);
      });
      
      // Check if new provider is in the list
      const foundProvider = providersResponse.data.data.find(
        p => p.email === providerData.email
      );
      
      if (foundProvider) {
        console.log('\n✅ SUCCESS: New provider appears in the list!');
        console.log('   Customers can now see this provider on the Find Providers page.');
      } else {
        console.log('\n❌ ERROR: New provider NOT found in the providers list!');
      }
      
    }
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProviderRegistration();
