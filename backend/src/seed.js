const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Provider = require('./models/Provider');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Provider.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('✅ Data cleared');

    // Create Users
    console.log('👤 Creating users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@washx.com',
        password: 'admin123',
        phone: '+1234567890',
        role: 'admin',
        address: {
          street: '123 Admin St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        isVerified: true,
        isActive: true
      },
      {
        name: 'John Customer',
        email: 'customer@test.com',
        password: 'customer123',
        phone: '+1234567891',
        role: 'customer',
        address: {
          street: '456 Customer Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: { lat: 40.7138, lng: -74.0070 }
        },
        isVerified: true,
        isActive: true
      },
      {
        name: 'Sarah Provider',
        email: 'provider@test.com',
        password: 'provider123',
        phone: '+1234567892',
        role: 'provider',
        address: {
          street: '789 Provider Blvd',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          coordinates: { lat: 40.7148, lng: -74.0080 }
        },
        isVerified: true,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Providers
    console.log('🏢 Creating providers...');
    const providers = await Provider.create([
      {
        userId: users[2]._id, // Sarah Provider
        businessName: 'QuickWash Laundry',
        description: 'Professional laundry services with quick turnaround time',
        businessLicense: 'LIC123456',
        address: {
          street: '789 Provider Blvd',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          coordinates: { lat: 40.7148, lng: -74.0080 }
        },
        phone: '+1234567892',
        email: 'provider@test.com',
        images: [
          'https://images.unsplash.com/photo-1517677129300-07b130802f46?w=500',
          'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500'
        ],
        operatingHours: {
          monday: { open: '08:00', close: '20:00', isClosed: false },
          tuesday: { open: '08:00', close: '20:00', isClosed: false },
          wednesday: { open: '08:00', close: '20:00', isClosed: false },
          thursday: { open: '08:00', close: '20:00', isClosed: false },
          friday: { open: '08:00', close: '20:00', isClosed: false },
          saturday: { open: '09:00', close: '18:00', isClosed: false },
          sunday: { open: '', close: '', isClosed: true }
        },
        rating: {
          average: 4.5,
          count: 25
        },
        totalOrders: 50,
        isVerified: true,
        isActive: true
      },
      {
        userId: users[2]._id,
        businessName: 'Premium Clean Services',
        description: 'High-end dry cleaning and laundry services',
        businessLicense: 'LIC789012',
        address: {
          street: '321 Clean St',
          city: 'New York',
          state: 'NY',
          zipCode: '10004',
          coordinates: { lat: 40.7158, lng: -74.0090 }
        },
        phone: '+1234567893',
        email: 'premium@test.com',
        images: [
          'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=500'
        ],
        operatingHours: {
          monday: { open: '07:00', close: '21:00', isClosed: false },
          tuesday: { open: '07:00', close: '21:00', isClosed: false },
          wednesday: { open: '07:00', close: '21:00', isClosed: false },
          thursday: { open: '07:00', close: '21:00', isClosed: false },
          friday: { open: '07:00', close: '21:00', isClosed: false },
          saturday: { open: '08:00', close: '20:00', isClosed: false },
          sunday: { open: '10:00', close: '16:00', isClosed: false }
        },
        rating: {
          average: 4.8,
          count: 42
        },
        totalOrders: 75,
        isVerified: true,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${providers.length} providers`);

    // Create Services
    console.log('🧺 Creating services...');
    const services = await Service.create([
      // Services for QuickWash Laundry
      {
        providerId: providers[0]._id,
        name: 'Wash & Fold',
        description: 'Standard washing and folding service for everyday clothes',
        category: 'Washing',
        prices: [{ unit: 'per kg', price: 5.99 }],
        duration: '24 hours',
        minOrder: '2 kg',
        features: [
          'Fabric-safe detergents',
          'Expert folding',
          'Quality checked',
          'Sorted by color'
        ],
        specialInstructions: 'Separate whites and colors for best results',
        active: true
      },
      {
        providerId: providers[0]._id,
        name: 'Express Wash & Fold',
        description: 'Fast washing and folding service - ready in 12 hours',
        category: 'Express',
        prices: [{ unit: 'per kg', price: 8.99 }],
        duration: '12 hours',
        minOrder: '3 kg',
        features: [
          'Same-day service',
          'Priority handling',
          'Premium detergents',
          'Rush processing'
        ],
        specialInstructions: 'Available for orders placed before 12 PM',
        active: true
      },
      {
        providerId: providers[0]._id,
        name: 'Ironing Service',
        description: 'Professional ironing for crisp, wrinkle-free clothes',
        category: 'Ironing',
        prices: [{ unit: 'per piece', price: 3.99 }],
        duration: '24 hours',
        minOrder: '5 pieces',
        features: [
          'Steam ironing',
          'Crease-free finish',
          'Hanger service',
          'Starch option available'
        ],
        specialInstructions: '',
        active: true
      },
      // Services for Premium Clean Services
      {
        providerId: providers[1]._id,
        name: 'Dry Cleaning',
        description: 'Premium dry cleaning for delicate garments',
        category: 'Dry Clean',
        prices: [
          { unit: 'per piece', price: 12.99 },
          { unit: 'per set', price: 29.99 }
        ],
        duration: '48 hours',
        minOrder: '1 piece',
        features: [
          'Eco-friendly solvents',
          'Stain treatment',
          'Quality inspection',
          'Protective packaging'
        ],
        specialInstructions: 'Special care for delicate fabrics',
        active: true
      },
      {
        providerId: providers[1]._id,
        name: 'Wash & Iron Premium',
        description: 'Complete wash and iron service with premium care',
        category: 'Premium',
        prices: [{ unit: 'per kg', price: 9.99 }],
        duration: '36 hours',
        minOrder: '3 kg',
        features: [
          'Premium detergents',
          'Hand ironing',
          'Packaging included',
          'Fabric softener'
        ],
        specialInstructions: '',
        active: true
      },
      {
        providerId: providers[1]._id,
        name: 'Specialty Cleaning',
        description: 'Specialized cleaning for wedding dresses, suits, and delicate items',
        category: 'Premium',
        prices: [
          { unit: 'per item', price: 25.99 },
          { unit: 'per bundle', price: 45.99 }
        ],
        duration: '3-5 days',
        minOrder: '1 item',
        features: [
          'Deep cleaning',
          'Sanitization',
          'Odor removal',
          'UV treatment'
        ],
        specialInstructions: 'Provide item dimensions if possible',
        active: true
      }
    ]);
    console.log(`✅ Created ${services.length} services`);

    // Update providers with their services
    await Provider.findByIdAndUpdate(providers[0]._id, {
      services: [services[0]._id, services[1]._id, services[2]._id]
    });
    await Provider.findByIdAndUpdate(providers[1]._id, {
      services: [services[3]._id, services[4]._id, services[5]._id]
    });

    // Create Bookings
    console.log('📅 Creating bookings...');
    const bookings = await Booking.create([
      {
        customerId: users[1]._id, // John Customer
        providerId: providers[0]._id, // QuickWash Laundry
        services: [
          {
            serviceId: services[0]._id, // Wash & Fold
            quantity: 5,
            price: 5.99
          }
        ],
        pickupAddress: {
          street: '456 Customer Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: { lat: 40.7138, lng: -74.0070 }
        },
        deliveryAddress: {
          street: '456 Customer Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: { lat: 40.7138, lng: -74.0070 }
        },
        pickupDate: new Date('2026-02-20'),
        pickupTime: '14:00',
        deliveryDate: new Date('2026-02-21'),
        specialInstructions: 'Please handle with care',
        status: 'delivered',
        payment: {
          method: 'online',
          status: 'paid',
          amount: 29.95,
          transactionId: 'TXN123456789'
        },
        totalAmount: 29.95
      },
      {
        customerId: users[1]._id,
        providerId: providers[1]._id, // Premium Clean Services
        services: [
          {
            serviceId: services[3]._id, // Dry Cleaning
            quantity: 2,
            price: 12.99
          }
        ],
        pickupAddress: {
          street: '456 Customer Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: { lat: 40.7138, lng: -74.0070 }
        },
        deliveryAddress: {
          street: '456 Customer Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: { lat: 40.7138, lng: -74.0070 }
        },
        pickupDate: new Date('2026-02-22'),
        pickupTime: '10:00',
        deliveryDate: new Date('2026-02-24'),
        status: 'in-progress',
        payment: {
          method: 'card',
          status: 'paid',
          amount: 25.98,
          transactionId: 'TXN987654321'
        },
        totalAmount: 25.98
      },
      {
        customerId: users[1]._id,
        providerId: providers[0]._id,
        services: [
          {
            serviceId: services[1]._id, // Express Wash & Fold
            quantity: 3,
            price: 8.99
          }
        ],
        pickupAddress: {
          street: '456 Customer Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: { lat: 40.7138, lng: -74.0070 }
        },
        deliveryAddress: {
          street: '456 Customer Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: { lat: 40.7138, lng: -74.0070 }
        },
        pickupDate: new Date('2026-02-25'),
        pickupTime: '16:00',
        status: 'pending',
        payment: {
          method: 'online',
          status: 'pending',
          amount: 26.97
        },
        totalAmount: 26.97
      }
    ]);
    console.log(`✅ Created ${bookings.length} bookings`);

    // Create Reviews
    console.log('⭐ Creating reviews...');
    const reviews = await Review.create([
      {
        bookingId: bookings[0]._id,
        customerId: users[1]._id,
        providerId: providers[0]._id,
        rating: 5,
        comment: 'Excellent service! My clothes came back fresh and neatly folded. Very professional and on time.',
        isVerified: true
      },
      {
        bookingId: bookings[0]._id,
        customerId: users[1]._id,
        providerId: providers[0]._id,
        rating: 4,
        comment: 'Good service overall. Pickup and delivery were punctual.',
        response: {
          comment: 'Thank you for your feedback! We appreciate your business.',
          date: new Date('2026-02-19')
        },
        isVerified: true
      }
    ]);
    console.log(`✅ Created ${reviews.length} reviews`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Providers: ${providers.length}`);
    console.log(`   Services: ${services.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log('\n✅ All collections have been automatically created in MongoDB Atlas!');
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin: admin@washx.com / admin123');
    console.log('   Customer: customer@test.com / customer123');
    console.log('   Provider: provider@test.com / provider123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Run seed
const runSeed = async () => {
  await connectDB();
  await seedData();
  mongoose.connection.close();
  console.log('\n👋 Database connection closed');
};

runSeed();
