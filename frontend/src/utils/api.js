import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('washx_user');
    if (user) {
      const token = JSON.parse(user).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('washx_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Mock data functions (replace with actual API calls)
export const mockProviders = [
  {
    id: '1',
    name: 'CleanWash Express',
    rating: 4.8,
    reviews: 245,
    distance: 1.2,
    deliveryTime: '2-3 hours',
    location: { lat: 40.7128, lng: -74.0060 },
    address: '123 Main St, New York, NY',
    services: [
      { id: '1', name: 'Wash & Fold', price: 15, unit: 'kg' },
      { id: '2', name: 'Dry Cleaning', price: 25, unit: 'item' },
      { id: '3', name: 'Iron Only', price: 10, unit: 'kg' },
      { id: '4', name: 'Steam Press', price: 20, unit: 'item' }
    ],
    promotions: ['20% off first order', 'Free pickup & delivery'],
    verified: true,
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=300'
  },
  {
    id: '2',
    name: 'Premium Laundry Care',
    rating: 4.6,
    reviews: 189,
    distance: 2.5,
    deliveryTime: '4-5 hours',
    location: { lat: 40.7580, lng: -73.9855 },
    address: '456 Park Ave, New York, NY',
    services: [
      { id: '1', name: 'Wash & Fold', price: 18, unit: 'kg' },
      { id: '2', name: 'Dry Cleaning', price: 30, unit: 'item' },
      { id: '3', name: 'Premium Care', price: 35, unit: 'item' },
      { id: '4', name: 'Steam Press', price: 22, unit: 'item' }
    ],
    promotions: ['Loyalty points 2x'],
    verified: true,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300'
  },
  {
    id: '3',
    name: 'QuickWash 24/7',
    rating: 4.9,
    reviews: 312,
    distance: 0.8,
    deliveryTime: '1-2 hours',
    location: { lat: 40.7489, lng: -73.9680 },
    address: '789 East Side, New York, NY',
    services: [
      { id: '1', name: 'Wash & Fold', price: 12, unit: 'kg' },
      { id: '2', name: 'Express Service', price: 20, unit: 'kg' },
      { id: '3', name: 'Iron Only', price: 8, unit: 'kg' }
    ],
    promotions: ['Express delivery available', 'Open 24/7'],
    verified: true,
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=300'
  }
];

export const getProviders = async (filters = {}) => {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockProviders];
      
      if (filters.search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.maxDistance) {
        filtered = filtered.filter(p => p.distance <= filters.maxDistance);
      }
      
      if (filters.minRating) {
        filtered = filtered.filter(p => p.rating >= filters.minRating);
      }
      
      if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'distance') {
        filtered.sort((a, b) => a.distance - b.distance);
      } else if (filters.sortBy === 'price') {
        filtered.sort((a, b) => a.services[0].price - b.services[0].price);
      }
      
      resolve(filtered);
    }, 500);
  });
};

export const getProviderById = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const provider = mockProviders.find(p => p.id === id);
      resolve(provider);
    }, 300);
  });
};
