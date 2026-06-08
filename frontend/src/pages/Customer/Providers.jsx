/**
 * Providers Page with Stripe Payment Integration
 * 
 * PAYMENT INTEGRATION NOTES:
 * -------------------------
 * This component includes a complete Stripe payment flow for online payments.
 * 
 * CURRENT IMPLEMENTATION (Frontend Only - Demo):
 * - Card number formatting (XXXX XXXX XXXX XXXX)
 * - Expiry date validation (MM/YY)
 * - CVV input (3 digits)
 * - Simulated payment processing
 * - Success/failure handling
 * 
 * FOR PRODUCTION DEPLOYMENT:
 * 1. Install Stripe packages:
 *    npm install @stripe/stripe-js @stripe/react-stripe-js
 * 
 * 2. Create a backend endpoint to create payment intent:
 *    POST /api/create-payment-intent
 *    Body: { amount, currency, metadata }
 * 
 * 3. Replace the processStripePayment function with actual Stripe API:
 *    - Load Stripe with publishable key
 *    - Create PaymentIntent on backend
 *    - Use stripe.confirmCardPayment() with client_secret
 *    - Handle 3D Secure authentication if required
 * 
 * 4. Add webhook handler on backend for payment confirmations:
 *    POST /api/webhooks/stripe
 *    Handle: payment_intent.succeeded, payment_intent.failed
 * 
 * 5. Store Stripe keys securely:
 *    - Frontend: REACT_APP_STRIPE_PUBLISHABLE_KEY
 *    - Backend: STRIPE_SECRET_KEY (never expose to frontend)
 * 
 * 6. Test with Stripe test cards:
 *    - Success: 4242 4242 4242 4242
 *    - Decline: 4000 0000 0000 0002
 *    - 3D Secure: 4000 0027 6000 3184
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, SlidersHorizontal, MapPin, Star, Package, Calendar, Clock, Phone, Mail, ArrowLeft, Settings, CreditCard, CheckCircle, X, ShoppingBasket, ShoppingBag } from 'lucide-react';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ItemBasedSelector from './ItemBasedSelector';
import api from '../../utils/api';
import { cartAPI } from '../../api/commerceApi';
import { redirectToPayHereCheckout } from '../../utils/payhere';
import './Providers.css';

const Providers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showProviderDetail, setShowProviderDetail] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [useTransportService, setUseTransportService] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false);
  const [showServiceList, setShowServiceList] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedItemService, setSelectedItemService] = useState(null);
  const [serviceGroup, setServiceGroup] = useState(null); // 'item' | 'bulk'
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkService, setBulkService] = useState(null);
  const [selectedBulkPackage, setSelectedBulkPackage] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSaving, setCartSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [bookingData, setBookingData] = useState({
    customerInfo: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    pickupDate: '',
    pickupSlot: '', // Morning / Afternoon / Evening
    serviceType: '',
    serviceId: null,
    pricingType: '',
    unitPrice: 0,
    items: [
      {
        category: 'Clothes',
        quantity: 1,
        weight: '',
        fabric: 'Cotton',
        color: 'Mixed'
      }
    ],
    notes: '',
    promoCode: '',
    paymentMethod: 'Cash on Delivery',
    invoiceRequired: false,
    estimate: { subtotal: 0, discount: 0, total: 0 },
    transportCost: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'rating',
    minRating: 0,
    maxDistance: 50,
    serviceType: 'all'
  });

  // Providers data from API
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState(null);

  // Fetch providers from API
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setProvidersLoading(true);
        setProvidersError(null);
        console.log('🔍 Fetching providers from API...');
        const response = await api.get('/providers/with-services');
        
        console.log('✅ Received providers:', response.data.count);
        
        if (response.data.success) {
          const transformedProviders = (response.data.data || []).map((provider) => {
            const services = Array.isArray(provider.services) ? provider.services : [];

            const serviceNames = services
              .map((s) => s?.serviceName)
              .filter(Boolean);

            const servicesDetailed = services
              .map((s) => ({
                serviceId: Number(s?.serviceId ?? 0),
                serviceName: String(s?.serviceName ?? ''),
                category: String(s?.category ?? ''),
                pricingType: String(s?.pricingType ?? ''),
                price: Number(s?.price ?? 0),
                minimumOrder: Number(s?.minimumOrder ?? 0),
                turnaroundTime: s?.turnaroundTime ?? '',
                description: s?.description ?? ''
              }))
              .filter((s) => s.serviceName);

            const prices = services
              .map((s) => Number(s?.price))
              .filter((p) => Number.isFinite(p));

            const minPrice = prices.length ? Math.min(...prices) : null;
            const maxPrice = prices.length ? Math.max(...prices) : null;
            const priceRange = (minPrice === null || maxPrice === null)
              ? '0-0'
              : `${Math.round(minPrice)}-${Math.round(maxPrice)}`;

            const specialties = Array.from(
              new Set(
                services
                  .map((s) => s?.category)
                  .filter(Boolean)
              )
            );

            return {
              id: provider.providerId,
              name: provider.businessName,
              image: '/wash1.jpg',
              rating: Number(provider.rating ?? 0),
              address: provider.businessAddress || '',
              phone: '',
              email: '',
              distance: 2.5,
              services: serviceNames,
              servicesDetailed,
              priceRange,
              description: provider.description || 'No description available',
              available: true,
              reviews: 0,
              specialties
            };
          });
          
          console.log('✅ Transformed providers:', transformedProviders.length);
          setProviders(transformedProviders);
        }
      } catch (error) {
        console.error('❌ Error fetching providers:', error);
        setProvidersError(error.response?.data?.message || 'Failed to fetch providers');
      } finally {
        setProvidersLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const refreshCartFromDb = async () => {
    if (!user || String(user.role).toLowerCase() !== 'customer') return;

    try {
      setCartLoading(true);
      const result = await cartAPI.get();
      const dbItems = result?.data || [];
      setCartItems((prev) => {
        const bulkOnly = prev.filter((x) => x.kind === 'bulk');
        return [...dbItems, ...bulkOnly];
      });
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    refreshCartFromDb();
  }, [user?.id, user?.token]);

  const getServiceGroup = (pricingType) => {
    const t = String(pricingType || '').toLowerCase();
    if (t.includes('kg') || t.includes('bulk') || t.includes('per_kg') || t.includes('perkg')) return 'bulk';
    if (
      t.includes('item') ||
      t.includes('piece') ||
      t.includes('bundle') ||
      t.includes('set') ||
      t.includes('unit') ||
      t.includes('per_item') ||
      t.includes('peritem')
    ) {
      return 'item';
    }
    return 'item';
  };

  const getServicesForGroup = (provider, group) => {
    const all = provider?.servicesDetailed || [];
    if (!group) return all;
    return all.filter((s) => getServiceGroup(s.pricingType) === group);
  };

  const formatServicePrice = (service) => {
    const group = getServiceGroup(service?.pricingType);
    const unit = group === 'bulk' ? '/ kg' : '/ item';
    return `Rs ${Number(service?.price ?? 0).toFixed(2)} ${unit}`;
  };

  const getBulkPackages = (service) => {
    const unitPrice = Number(service?.price ?? 0);
    const base = [
      { bags: 1, maxKg: 5, discount: 1 },
      { bags: 2, maxKg: 10, discount: 0.97 },
      { bags: 3, maxKg: 15, discount: 0.95 },
      { bags: 4, maxKg: 20, discount: 0.93 }
    ];

    return base.map((p) => {
      const raw = unitPrice * p.maxKg;
      const price = Math.round(raw * p.discount * 100) / 100;
      return {
        id: `${service?.serviceId || 'svc'}-${p.bags}`,
        ...p,
        price
      };
    });
  };

  const openBulkPackageModal = (service) => {
    setBulkService(service);
    setSelectedBulkPackage(null);
    setShowBulkModal(true);
  };

  const closeBulkPackageModal = () => {
    setShowBulkModal(false);
    setBulkService(null);
    setSelectedBulkPackage(null);
  };

  const addBulkToCart = () => {
    if (!selectedProvider || !bulkService || !selectedBulkPackage) return;

    const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
    const item = {
      id,
      kind: 'bulk',
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      serviceId: bulkService.serviceId,
      serviceName: bulkService.serviceName,
      pricingType: bulkService.pricingType,
      unitPrice: Number(bulkService.price ?? 0),
      bags: selectedBulkPackage.bags,
      maxKg: selectedBulkPackage.maxKg,
      price: selectedBulkPackage.price
    };

    setCartItems((prev) => [...prev, item]);
    closeBulkPackageModal();
    setShowCartModal(true);
  };

  const openItemSelector = (service) => {
    setSelectedItemService(service);
    setShowServiceList(false);
    setShowItemSelector(true);
  };

  const addItemSelectionsToCart = async (selectedItems) => {
    if (!selectedProvider || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return;
    }

    if (String(user?.role).toLowerCase() !== 'customer') {
      alert('Please log in as a customer to add items to cart.');
      return;
    }

    try {
      setCartSaving(true);
      for (const entry of selectedItems) {
        await cartAPI.add({
          providerId: Number(selectedProvider.id),
          itemId: Number(entry.itemId),
          quantity: Number(entry.quantity || 1)
        });
      }
      await refreshCartFromDb();
      setShowCartModal(true);
    } catch (err) {
      console.error('Add to cart failed:', err);
      alert(err.response?.data?.message || 'Failed to save items to cart');
    } finally {
      setCartSaving(false);
    }
  };

  const removeCartItem = async (cartRow) => {
    if (cartRow?.kind === 'bulk') {
      setCartItems((prev) => prev.filter((x) => x.id !== cartRow.id));
      return;
    }

    if (!cartRow?.cartItemId) return;

    try {
      const result = await cartAPI.remove(cartRow.cartItemId);
      const dbItems = result?.data || [];
      setCartItems((prev) => {
        const bulkOnly = prev.filter((x) => x.kind === 'bulk');
        return [...dbItems, ...bulkOnly];
      });
    } catch (err) {
      console.error('Remove cart item failed:', err);
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCartItems((prev) => prev.filter((x) => x.kind === 'bulk'));
    } catch (err) {
      console.error('Clear cart failed:', err);
      alert(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  const buildCartItemsDescription = () => {
    return cartItems
      .map((it) => {
        if (it.kind === 'item') {
          return `${it.itemName} x${it.quantity}`;
        }
        return `${it.serviceName} (${it.bags} bag)`;
      })
      .join(', ');
  };

  const goToCheckout = async () => {
    if (cartItems.length === 0) return;

    const match = window.location.pathname.match(/\/customer\/([^/]+)/);
    const customerId = match?.[1];

    if (!customerId) {
      alert('Customer route not found for checkout');
      return;
    }

    const total = cartItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
    if (total <= 0) {
      alert('Cart total must be greater than zero');
      return;
    }

    const nameParts = String(user?.name || user?.Name || 'Customer').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'WashX';

    setCheckoutLoading(true);

    try {
      const response = await api.post('/payments/payhere/checkout', {
        amount: total,
        items: buildCartItemsDescription(),
        firstName,
        lastName,
        email: user?.email || user?.Email || '',
        phone: user?.phone || user?.Phone || '',
        address: user?.address || 'Colombo',
        city: 'Colombo'
      });

      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to prepare PayHere checkout');
      }

      const payment = response.data.data;

      sessionStorage.setItem('washx_payhere_order', payment.order_id);
      sessionStorage.setItem('washx_checkout_cart', JSON.stringify(cartItems));

      setShowCartModal(false);
      redirectToPayHereCheckout(payment);
      // Page navigates to PayHere — no further UI updates needed
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || error.message || 'Failed to start PayHere payment');
      setCheckoutLoading(false);
    }
  };

  const CartButton = () => (
    <button
      type="button"
      className="cart-fab"
      onClick={() => setShowCartModal(true)}
      aria-label="Open cart"
    >
      <ShoppingBasket size={22} />
      {cartItems.length > 0 && (
        <span className="cart-badge">{cartItems.length}</span>
      )}
    </button>
  );

  const openServiceTypePicker = (provider) => {
    setSelectedProvider(provider);
    setShowProviderDetail(false);
    setShowBookingForm(false);
    setShowServiceList(false);
    setServiceGroup(null);
    setShowServiceTypeModal(true);
    setShowPaymentModal(false);
    setPaymentProcessing(false);
    setPaymentSuccess(false);
    setShowBulkModal(false);
    setBulkService(null);
    setSelectedBulkPackage(null);
    setShowItemSelector(false);
    setSelectedItemService(null);
    resetCardDetails();
  };

  const goToServiceList = (group) => {
    setServiceGroup(group);
    setShowItemSelector(false);
    setSelectedItemService(null);
    setShowServiceTypeModal(false);
    setShowServiceList(true);
  };

  const goToItemBasedSelector = () => {
    if (!selectedProvider) return;
    const itemServices = getServicesForGroup(selectedProvider, 'item');
    if (itemServices.length === 0) return;

    setServiceGroup('item');
    setShowServiceTypeModal(false);
    setShowItemSelector(false);
    setSelectedItemService(null);

    if (itemServices.length === 1) {
      setSelectedItemService(itemServices[0]);
      setShowItemSelector(true);
      return;
    }

    setShowServiceList(true);
  };

  const startBookingForService = (service) => {
    const initialItems = getServiceGroup(service?.pricingType) === 'bulk'
      ? [{ category: 'Clothes', quantity: 1, weight: '', fabric: 'Cotton', color: 'Mixed' }]
      : [{ category: 'Shirt', quantity: 1, weight: '', fabric: 'Cotton', color: 'Mixed' }];

    const nextBooking = {
      customerInfo: { name: '', phone: '', email: '', address: '' },
      pickupDate: '',
      pickupSlot: '',
      serviceType: service?.serviceName || '',
      serviceId: service?.serviceId || null,
      pricingType: service?.pricingType || '',
      unitPrice: Number(service?.price ?? 0),
      items: initialItems,
      notes: '',
      promoCode: '',
      paymentMethod: 'Cash on Delivery',
      invoiceRequired: false,
      estimate: { subtotal: 0, discount: 0, total: 0 },
      transportCost: 0
    };
    nextBooking.estimate = calcEstimate(nextBooking);

    setShowServiceList(false);
    setShowBookingForm(true);
    setBookingData(nextBooking);
  };

  const filteredProviders = providers.filter(provider => {
    if (filters.search && !provider.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.minRating && provider.rating < filters.minRating) {
      return false;
    }
    if (filters.maxDistance && provider.distance > filters.maxDistance) {
      return false;
    }
    if (filters.serviceType !== 'all' && !provider.services.some(service => 
      service.toLowerCase().includes(filters.serviceType.toLowerCase())
    )) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'distance':
        return a.distance - b.distance;
      case 'price':
        return parseInt(a.priceRange.split('-')[0]) - parseInt(b.priceRange.split('-')[0]);
      case 'rating':
      default:
        return b.rating - a.rating;
    }
  });

  // Pricing helpers
  const baseRates = {
    'Wash & Fold': 8,
    'Wash & Iron': 10,
    'Dry Clean': 15,
    'Iron Only': 5,
    'Express Service': 20
  };

  const calcEstimate = (data) => {
    const d = data || bookingData;
    const resolvedUnitPrice = Number(d.unitPrice) || baseRates[d.serviceType] || 0;
    const group = getServiceGroup(d.pricingType);
    let subtotal = 0;
    d.items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const weight = Number(it.weight) || 0;
      if (group === 'bulk') {
        subtotal += weight * resolvedUnitPrice;
      } else {
        subtotal += qty * resolvedUnitPrice;
      }
    });
    let discount = 0;
    const code = (d.promoCode || '').trim().toUpperCase();
    if (code === 'SAVE10') discount = subtotal * 0.1;
    if (code === 'SAVE20') discount = subtotal * 0.2;
    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total };
  };

  const setAndRecalc = (updater) => {
    setBookingData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { ...next, estimate: calcEstimate(next) };
    });
  };

  const addItem = () => {
    const group = getServiceGroup(bookingData.pricingType);
    const newItem = group === 'bulk'
      ? { category: 'Clothes', quantity: 1, weight: '', fabric: 'Cotton', color: 'Mixed' }
      : { category: 'Shirt', quantity: 1, weight: '', fabric: 'Cotton', color: 'Mixed' };
    setAndRecalc(prev => ({
      ...prev,
      items: [
        ...prev.items,
        newItem
      ]
    }));
  };

  const updateItem = (index, key, value) => {
    setAndRecalc(prev => {
      const items = prev.items.map((it, i) => i === index ? { ...it, [key]: value } : it);
      return { ...prev, items };
    });
  };

  const removeItemRow = (index) => {
    setAndRecalc(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'rating',
      minRating: 0,
      maxDistance: 50,
      serviceType: 'all'
    });
  };

  const handleBookService = (provider) => {
    // Backward-compatible entry point: open the service type picker
    openServiceTypePicker(provider);
  };

  const submitBooking = () => {
    // Validate form
    if (!bookingData.customerInfo.name || !bookingData.customerInfo.phone || 
        !bookingData.customerInfo.email || !bookingData.customerInfo.address || 
        !bookingData.pickupDate || !bookingData.pickupSlot) {
      alert('Please fill in all required fields');
      return;
    }

    // Show current payment method to user
    const currentMethod = bookingData.paymentMethod;
    console.log('========================================');
    console.log('PAYMENT METHOD:', currentMethod);
    console.log('========================================');

    // CRITICAL: This modal should ONLY open for "Online Payment"
    // For "Cash on Delivery" it should process booking directly
    
    if (currentMethod === 'Online Payment') {
      // ✅ CORRECT: Open payment modal for Online Payment
      console.log('✅ Online Payment detected → OPENING PAYMENT MODAL');
      setShowPaymentModal(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentMethod === 'Cash on Delivery') {
      // ✅ CORRECT: Process directly for Cash on Delivery (NO MODAL)
      console.log('✅ Cash on Delivery detected → PROCESSING DIRECTLY (NO MODAL)');
      processBooking();
    } else {
      console.error('❌ Unknown payment method:', currentMethod);
    }
  };

  const processBooking = () => {
    console.log('Booking submitted:', {
      provider: selectedProvider,
      bookingData
    });
    // Here you would typically send the booking to your backend
    alert(`Booking confirmed! Payment Method: ${bookingData.paymentMethod}`);
    setShowBookingForm(false);
    setShowServiceList(false);
    setShowServiceTypeModal(false);
    setServiceGroup(null);
    setShowProviderDetail(false);
    setSelectedProvider(null);
    resetCardDetails();
  };

  const resetCardDetails = () => {
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    setShowCardForm(false);
  };
    
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      // Format as XXXX XXXX XXXX XXXX
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setCardDetails({ ...cardDetails, cardNumber: value });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\//g, '');
    if (value.length <= 4 && /^\d*$/.test(value)) {
      // Format as MM/YY
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      setCardDetails({ ...cardDetails, expiryDate: value });
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCardDetails({ ...cardDetails, cvv: value });
    }
  };

  const processStripePayment = async () => {
    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || 
        !cardDetails.cvv || !cardDetails.cardholderName) {
      alert('Please fill in all card details');
      return;
    }

    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Invalid card number');
      return;
    }

    if (cardDetails.cvv.length !== 3) {
      alert('Invalid CVV');
      return;
    }

    setPaymentProcessing(true);

    // Simulate Stripe payment processing
    // In production, you would:
    // 1. Create a payment intent on your backend
    // 2. Use Stripe.js to confirm the payment
    // 3. Handle the response
    
    setTimeout(() => {
      // Simulate successful payment
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      
      // After 2 seconds, process the booking
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        processBooking();
      }, 2000);
    }, 2000);
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setShowBookingForm(true);
    setBookingData((prev) => ({
      ...prev,
      estimate: { ...prev.estimate, subtotal: parseFloat(provider.priceRange.split('-')[0]) },
      transportCost: provider.transportCost || 0
    }));
  };

  const handleTransportToggle = () => {
    setUseTransportService(!useTransportService);
    setBookingData((prev) => ({
      ...prev,
      estimate: {
        ...prev.estimate,
        total: prev.estimate.subtotal + (useTransportService ? 0 : prev.transportCost)
      }
    }));
  };

  // Stripe Payment Modal — must be checked BEFORE any other early return
  if (showPaymentModal) {
    return (
      <>
        <CustomerNavbar />
        <div className="sp-overlay">
          <div className="sp-modal">
            {!paymentSuccess ? (
              <>
                <div className="sp-header">
                  <button 
                    className="sp-close-btn" 
                    onClick={() => {
                      setShowPaymentModal(false);
                      resetCardDetails();
                      setPaymentProcessing(false);
                      setPaymentSuccess(false);
                      setShowCardForm(false);
                    }}
                    disabled={paymentProcessing}
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="sp-total-section">
                  <span className="sp-total-label">Total due today:</span>
                  <span className="sp-total-amount">
                    Rs {Math.floor(bookingData.estimate.total)}
                    <sup>.{((bookingData.estimate.total % 1) * 100).toFixed(0).padStart(2, '0')}</sup>
                  </span>
                </div>

                {!showCardForm ? (
                  <>
                    <div className="sp-express-section">
                      <h3 className="sp-express-title">Express checkout</h3>
                    </div>

                    <div className="sp-express-buttons">
                      <button className="sp-express-btn sp-paypal-btn" disabled={paymentProcessing}>
                        <span className="sp-paypal-text">
                          <span className="sp-pay-blue">Pay</span><span className="sp-pal-blue">Pal</span>
                        </span>
                      </button>

                      <button className="sp-express-btn sp-gpay-btn" disabled={paymentProcessing}>
                        <div className="sp-gpay-content">
                          <span className="sp-gpay-logo">G Pay</span>
                          <span className="sp-gpay-divider">|</span>
                          <span className="sp-gpay-card">
                            <span className="sp-visa-badge">VISA</span>
                            •••• 0894
                          </span>
                        </div>
                      </button>

                      <button className="sp-express-btn sp-apple-btn" disabled={paymentProcessing}>
                        <span className="sp-apple-logo"> Pay</span>
                      </button>

                      <button 
                        className="sp-card-btn"
                        onClick={() => setShowCardForm(true)}
                        disabled={paymentProcessing}
                      >
                        <span className="sp-card-btn-text">Pay with card</span>
                        <div className="sp-card-brands">
                          <span className="sp-brand sp-mc">
                            <svg width="26" height="16" viewBox="0 0 26 16"><circle cx="9" cy="8" r="7" fill="#EB001B"/><circle cx="17" cy="8" r="7" fill="#F79E1B"/><path d="M13 2.4a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#FF5F00"/></svg>
                          </span>
                          <span className="sp-brand sp-maestro">
                            <svg width="26" height="16" viewBox="0 0 26 16"><circle cx="9" cy="8" r="7" fill="#6C6BBD"/><circle cx="17" cy="8" r="7" fill="#009DDD"/><path d="M13 2.4a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#6C6BBD" opacity="0.7"/></svg>
                          </span>
                          <span className="sp-brand sp-visa-logo">
                            <svg width="32" height="16" viewBox="0 0 32 16"><rect width="32" height="16" rx="2" fill="#1434CB"/><text x="16" y="11.5" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">VISA</text></svg>
                          </span>
                          <span className="sp-brand sp-amex">
                            <svg width="26" height="16" viewBox="0 0 26 16"><rect width="26" height="16" rx="2" fill="#006FCF"/><text x="13" y="11" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">AMERICAN</text><text x="13" y="7" fontFamily="Arial" fontSize="5" fill="white" textAnchor="middle">EXPRESS</text></svg>
                          </span>
                          <span className="sp-brand sp-jcb">
                            <svg width="22" height="16" viewBox="0 0 22 16"><rect width="22" height="16" rx="2" fill="#0E4C96"/><text x="11" y="11" fontFamily="Arial" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">JCB</text></svg>
                          </span>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="sp-card-form">
                    <div className="sp-card-form-header">
                      <button className="sp-back-btn" onClick={() => setShowCardForm(false)}>
                        ← Back
                      </button>
                      <h3 className="sp-card-form-title">Pay with card</h3>
                    </div>

                    <div className="sp-input-group">
                      <label className="sp-input-label">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.cardholderName}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                        placeholder="Full name on card"
                        disabled={paymentProcessing}
                        className="sp-input"
                      />
                    </div>

                    <div className="sp-input-group">
                      <label className="sp-input-label">Card Number</label>
                      <div className="sp-input-with-icons">
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 1234 1234 1234"
                          maxLength="19"
                          disabled={paymentProcessing}
                          className="sp-input"
                        />
                        <div className="sp-input-card-icons">
                          <svg width="24" height="16" viewBox="0 0 32 16"><rect width="32" height="16" rx="2" fill="#1434CB"/><text x="16" y="11.5" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">VISA</text></svg>
                          <svg width="20" height="14" viewBox="0 0 26 16"><circle cx="9" cy="8" r="7" fill="#EB001B"/><circle cx="17" cy="8" r="7" fill="#F79E1B"/><path d="M13 2.4a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#FF5F00"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="sp-input-row">
                      <div className="sp-input-group">
                        <label className="sp-input-label">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={handleExpiryChange}
                          placeholder="MM / YY"
                          maxLength="5"
                          disabled={paymentProcessing}
                          className="sp-input"
                        />
                      </div>
                      <div className="sp-input-group">
                        <label className="sp-input-label">CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={handleCvvChange}
                          placeholder="CVV"
                          maxLength="3"
                          disabled={paymentProcessing}
                          className="sp-input"
                        />
                      </div>
                    </div>

                    <button 
                      className="sp-pay-btn"
                      onClick={processStripePayment}
                      disabled={paymentProcessing}
                    >
                      {paymentProcessing ? (
                        <>
                          <div className="sp-spinner"></div>
                          Processing...
                        </>
                      ) : (
                        <>Pay Rs {bookingData.estimate.total.toFixed(2)}</>
                      )}
                    </button>

                    <div className="sp-secure-note">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>Your payment is secure and encrypted</span>
                    </div>
                  </div>
                )}

                <div className="sp-powered-by">
                  Powered by <strong>Stripe</strong>
                </div>
              </>
            ) : (
              <div className="sp-success">
                <div className="sp-success-icon">
                  <CheckCircle size={80} color="#10b981" />
                </div>
                <h2>Payment Successful!</h2>
                <p>Your booking is being confirmed...</p>
              </div>
            )}
          </div>
        </div>
        <CartButton />
      </>
    );
  }

  // Bulk Package Modal (Bag-based picker)
  if (showBulkModal && bulkService) {
    const pkgs = getBulkPackages(bulkService);

    return (
      <>
        <CustomerNavbar />
        <div className="sp-overlay">
          <div className="bulk-modal">
            <div className="bulk-modal-header">
              <h2 className="bulk-modal-title">{bulkService.serviceName}</h2>
              <button className="bulk-close-btn" onClick={closeBulkPackageModal}>
                <X size={24} />
              </button>
            </div>

            <div className="bulk-cards-row">
              {pkgs.map((p) => {
                const selected = selectedBulkPackage?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`bulk-card ${selected ? 'selected' : ''}`}
                    onClick={() => setSelectedBulkPackage(p)}
                  >
                    <div className="bulk-card-top">
                      <div className="bulk-bag-label">{p.bags} BAG</div>
                      <div className="bulk-bag-icons">
                        {Array.from({ length: p.bags }).map((_, i) => (
                          <ShoppingBag key={i} size={20} />
                        ))}
                      </div>
                    </div>

                    <div className="bulk-price">Rs.{Number(p.price).toFixed(2)}</div>
                    <div className="bulk-sub">{p.bags} bag{p.bags > 1 ? 's' : ''} included</div>
                    <div className="bulk-sub">Up to {p.maxKg}Kg</div>
                  </button>
                );
              })}
            </div>

            <div className="bulk-actions">
              <button
                type="button"
                className="bulk-add-btn"
                onClick={addBulkToCart}
                disabled={!selectedBulkPackage}
              >
                Add
              </button>
            </div>
          </div>
        </div>
        <CartButton />
      </>
    );
  }

  // Cart Sidebar
  if (showCartModal) {
    const total = cartItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0);

    return (
      <>
        <CustomerNavbar />
        <div className="cart-sidebar-overlay" onClick={() => setShowCartModal(false)}>
          <aside className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-sidebar-header">
              <h2 className="service-mode-title">Cart</h2>
              <button className="sp-close-btn" onClick={() => setShowCartModal(false)} aria-label="Close cart">
                <X size={22} />
              </button>
            </div>
            <p className="service-mode-subtitle">{cartItems.length} item(s)</p>

            {cartLoading ? (
              <div className="no-bookings" style={{ padding: '2rem 1rem', minHeight: '200px' }}>
                <p>Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="no-bookings" style={{ padding: '2rem 1rem', minHeight: '200px' }}>
                <Package size={48} />
                <h3>Your cart is empty</h3>
                <p>Add item-based or bulk services to see them here.</p>
              </div>
            ) : (
              <div className="cart-list cart-list-scroll">
                {cartItems.map((it) => (
                  <div key={it.cartItemId || it.id} className="cart-row">
                    <div className="cart-row-main">
                      <div className="cart-row-title">{it.kind === 'item' ? it.itemName : it.serviceName}</div>
                      <div className="cart-row-sub">
                        {it.kind === 'item'
                          ? `${it.providerName} • Qty ${it.quantity} • Rs ${Number(it.unitPrice).toFixed(2)} each`
                          : `${it.providerName} • ${it.bags} bag • up to ${it.maxKg}kg`}
                      </div>
                    </div>
                    <div className="cart-row-right">
                      <div className="cart-row-price">Rs {Number(it.price).toFixed(2)}</div>
                      <button type="button" className="cart-remove" onClick={() => removeCartItem(it)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="cart-total">
                  <span>Total</span>
                  <strong>Rs {total.toFixed(2)}</strong>
                </div>
              </div>
            )}

            <div className="cart-sidebar-actions">
              <button className="cancel-btn" onClick={clearCart}>
                Clear Cart
              </button>
              <button
                className="submit-btn"
                onClick={goToCheckout}
                disabled={cartItems.length === 0 || checkoutLoading}
              >
                {checkoutLoading ? 'Opening PayHere...' : 'Go to Checkout'}
              </button>
            </div>
          </aside>
        </div>
        <CartButton />
      </>
    );
  }

  // Service Type Picker Modal
  if (showServiceTypeModal && selectedProvider) {
    const itemCount = getServicesForGroup(selectedProvider, 'item').length;
    const bulkCount = getServicesForGroup(selectedProvider, 'bulk').length;

    return (
      <>
        <CustomerNavbar />
        <div className="sp-overlay">
          <div className="sp-modal">
            <div className="sp-header">
              <button
                className="sp-close-btn"
                onClick={() => {
                  setShowServiceTypeModal(false);
                  setSelectedProvider(null);
                  setServiceGroup(null);
                }}
              >
                <X size={22} />
              </button>
            </div>

            <h2 className="service-mode-title">Choose Service Type</h2>
            <p className="service-mode-subtitle">{selectedProvider.name}</p>

            <div className="payment-method-options">
              <div
                className={`payment-method-card ${itemCount === 0 ? 'disabled' : ''}`}
                onClick={() => itemCount > 0 && goToItemBasedSelector()}
              >
                <div className="payment-method-content">
                  <Package size={24} />
                  <span>Item-based services</span>
                  <small>{itemCount} available</small>
                  <p className="payment-method-description">Priced per item/piece</p>
                </div>
              </div>

              <div
                className={`payment-method-card ${bulkCount === 0 ? 'disabled' : ''}`}
                onClick={() => bulkCount > 0 && goToServiceList('bulk')}
              >
                <div className="payment-method-content">
                  <Settings size={24} />
                  <span>Bulk (per kg) services</span>
                  <small>{bulkCount} available</small>
                  <p className="payment-method-description">Priced per kilogram</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CartButton />
      </>
    );
  }

  // Services List View (Item-based / Bulk)
  if (showServiceList && selectedProvider) {
    const services = getServicesForGroup(selectedProvider, serviceGroup);
    const title = serviceGroup === 'bulk' ? 'Bulk (per kg) services' : 'Item-based services';

    return (
      <>
        <CustomerNavbar />
        <div className="bookings-page">
          <div className="bookings-main">
            <div className="bookings-header">
              <button
                className="back-button"
                onClick={() => {
                  setShowServiceList(false);
                  setShowServiceTypeModal(true);
                }}
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <h1>{selectedProvider.name}</h1>
              <p>Select one of the {title} below</p>
            </div>

            <div className="service-list-container">
              {services.length === 0 ? (
                <div className="no-bookings">
                  <Package size={48} />
                  <h3>No services found</h3>
                  <p>This provider has no services in this category.</p>
                </div>
              ) : (
                <div className="service-list-grid">
                  {services.map((s) => (
                    <button
                      key={`${s.serviceId}-${s.serviceName}`}
                      type="button"
                      className="service-select-card"
                      onClick={() => (serviceGroup === 'bulk' ? openBulkPackageModal(s) : openItemSelector(s))}
                    >
                      <div className="service-select-top">
                        <div>
                          <div className="service-select-name">{s.serviceName}</div>
                          {s.category && <div className="service-select-meta">{s.category}</div>}
                        </div>
                        <div className="service-select-price">{formatServicePrice(s)}</div>
                      </div>

                      <div className="service-select-bottom">
                        {Number.isFinite(s.minimumOrder) && s.minimumOrder > 0 && (
                          <span className="service-pill">Min order: {s.minimumOrder}</span>
                        )}
                        {s.turnaroundTime && <span className="service-pill">{s.turnaroundTime}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <CartButton />
      </>
    );
  }

  // Item-based selector page
  if (showItemSelector && selectedProvider && selectedItemService) {
    return (
      <>
        <CustomerNavbar />
        <div className="bookings-page">
          <div className="bookings-main">
            <ItemBasedSelector
              provider={selectedProvider}
              service={selectedItemService}
              onBack={() => {
                setShowItemSelector(false);
                setSelectedItemService(null);
                const itemServices = getServicesForGroup(selectedProvider, 'item');
                if (itemServices.length > 1) {
                  setServiceGroup('item');
                  setShowServiceList(true);
                } else {
                  setShowServiceTypeModal(true);
                }
              }}
              onAddToCart={addItemSelectionsToCart}
            />
          </div>
        </div>
        <CartButton />
      </>
    );
  }

  // Provider Detail View (legacy)
  if (selectedProvider && showProviderDetail && !showBookingForm) {
    return (
      <>
        <CustomerNavbar />
        <div className="bookings-page">
          <div className="bookings-main">
            <div className="bookings-header">
              <button 
                className="back-button"
                onClick={() => setSelectedProvider(null)}
              >
                <ArrowLeft size={20} />
                Back to Providers
              </button>
              <h1>{selectedProvider.name}</h1>
              <p>{selectedProvider.description}</p>
            </div>

            <div className="detail-container">
              <div className="detail-content">
                <div className="detail-main">
                  <div className="detail-provider-section">
                    {/* Provider Image with overlay */}
                    <div className="detail-inner-image-section">
                      <img 
                        src={selectedProvider.image} 
                        alt={selectedProvider.name}
                        className="detail-inner-laundry-image"
                      />
                      <div className="detail-image-overlay">
                        <div className="detail-overlay-settings">
                          <Settings size={32} className="detail-settings-icon" />
                        </div>
                        <div className="detail-overlay-content">
                          <h2 className="detail-overlay-title">{selectedProvider.name}</h2>
                          <div className="detail-overlay-services">
                            {selectedProvider.services.map((service, index) => (
                              <span key={index} className="detail-overlay-service-tag">{service}</span>
                            ))}
                          </div>
                        </div>
                        <button 
                          className="detail-order-button"
                          onClick={() => handleBookService(selectedProvider)}
                        >
                          Book Service
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="detail-description">{selectedProvider.description}</p>

                    {/* Rating and reviews */}
                    <div className="detail-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={18} 
                          fill={star <= Math.floor(selectedProvider.rating) ? "#fbbf24" : "none"}
                          color="#fbbf24"
                        />
                      ))}
                      <span>{selectedProvider.rating} ({selectedProvider.reviews} reviews)</span>
                    </div>

                    {/* Specialties */}
                    <div className="specialties-section">
                      <h4>Specialties</h4>
                      <div className="specialties-tags">
                        {selectedProvider.specialties.map((specialty, index) => (
                          <span key={index} className="specialty-tag">{specialty}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="detail-info-grid">
                    <div className="detail-info-card">
                      <h3>Service Information</h3>
                      <div className="detail-info-item">
                        <Package size={18} />
                        <span>Price Range: Rs {selectedProvider.priceRange}</span>
                      </div>
                      <div className="detail-info-item">
                        <MapPin size={18} />
                        <span>Distance: {selectedProvider.distance} km</span>
                      </div>
                      <div className="detail-info-item">
                        <Star size={18} />
                        <span>{selectedProvider.reviews} Reviews</span>
                      </div>
                    </div>

                    <div className="detail-info-card">
                      <h3>Contact & Location</h3>
                      <div className="detail-info-item">
                        <MapPin size={18} />
                        <span>{selectedProvider.address}</span>
                      </div>
                      <div className="detail-info-item">
                        <Phone size={18} />
                        <span>{selectedProvider.phone}</span>
                      </div>
                      <div className="detail-info-item">
                        <Mail size={18} />
                        <span>{selectedProvider.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-image-section">
                  <div className="detail-image-container">
                    <img 
                      src="/map1.png" 
                      alt="Location Map"
                      className="detail-provider-image"
                    />
                  </div>
                  
                  <div className="detail-image-container">
                    <div className="detail-calendar">
                      <div className="detail-calendar-header">
                        <button className="detail-calendar-nav">&lt;</button>
                        <span className="detail-calendar-month">December 2025</span>
                        <button className="detail-calendar-nav">&gt;</button>
                      </div>
                      <div className="detail-calendar-grid">
                        <div className="detail-calendar-day-header">Sun</div>
                        <div className="detail-calendar-day-header">Mon</div>
                        <div className="detail-calendar-day-header">Tue</div>
                        <div className="detail-calendar-day-header">Wed</div>
                        <div className="detail-calendar-day-header">Thu</div>
                        <div className="detail-calendar-day-header">Fri</div>
                        <div className="detail-calendar-day-header">Sat</div>
                        
                        {/* Calendar Days */}
                        {[...Array(31)].map((_, i) => {
                          const day = i + 1;
                          const isToday = day === new Date().getDate();
                          
                          return (
                            <div 
                              key={i} 
                              className={`detail-calendar-day ${day < new Date().getDate() ? 'disabled' : ''} ${isToday ? 'today' : ''}`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CartButton />
      </>
    );
  }

  // Booking Form Modal
  if (showBookingForm) {
    const group = getServiceGroup(bookingData.pricingType);
    const availableServices = getServicesForGroup(selectedProvider, group);
    const isBulk = group === 'bulk';
    const itemsValid = isBulk
      ? bookingData.items.every((it) => Number(it.weight) > 0)
      : bookingData.items.every((it) => Number(it.quantity) > 0);

    return (
      <>
        <CustomerNavbar />
        <div className="bookings-page">
          <div className="bookings-main">
            <div className="bookings-header">
              <button 
                className="back-button"
                onClick={() => {
                  setShowBookingForm(false);
                  setShowServiceList(true);
                }}
              >
                <ArrowLeft size={20} />
                Back to Services
              </button>
              <h1>Book Service with {selectedProvider.name}</h1>
              <p>Fill in the details for your laundry service</p>
            </div>

            <div className="booking-form-container">
              <div className="booking-form">
                <div className="booking-header">
                  <h2>Book Laundry Service</h2>
                </div>


                {/* Customer Details */}
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={bookingData.customerInfo.name}
                    onChange={(e) => setAndRecalc({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, name: e.target.value }
                    })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={bookingData.customerInfo.phone}
                    onChange={(e) => setAndRecalc({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, phone: e.target.value }
                    })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={bookingData.customerInfo.email}
                    onChange={(e) => setAndRecalc({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, email: e.target.value }
                    })}
                    placeholder="Email for confirmations"
                  />
                </div>
                <div className="form-group">
                  <label>Pickup Address</label>
                  <input
                    type="text"
                    value={bookingData.customerInfo.address}
                    onChange={(e) => setAndRecalc({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, address: e.target.value }
                    })}
                    placeholder="Your address"
                  />
                </div>

                {/* Schedule */}
                <div className="form-group">
                  <label>Pickup Date</label>
                  <input
                    type="date"
                    value={bookingData.pickupDate}
                    onChange={(e) => setAndRecalc({ ...bookingData, pickupDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Pickup Time Slot</label>
                  <select
                    value={bookingData.pickupSlot}
                    onChange={(e) => setAndRecalc({ ...bookingData, pickupSlot: e.target.value })}
                  >
                    <option value="">Select a slot</option>
                    <option value="Morning">Morning (8am - 12pm)</option>
                    <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                    <option value="Evening">Evening (4pm - 8pm)</option>
                  </select>
                </div>

                {/* Service Type */}
                <div className="form-group">
                  <label>Service Type</label>
                  <select
                    value={bookingData.serviceId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const svc = availableServices.find((s) => Number(s.serviceId) === id);
                      setAndRecalc({
                        ...bookingData,
                        serviceId: id,
                        serviceType: svc?.serviceName || '',
                        pricingType: svc?.pricingType || bookingData.pricingType,
                        unitPrice: Number(svc?.price ?? bookingData.unitPrice)
                      });
                    }}
                  >
                    {availableServices.length === 0 ? (
                      <option value="">No services available</option>
                    ) : (
                      availableServices.map((s) => (
                        <option key={`${s.serviceId}-${s.serviceName}`} value={s.serviceId}>
                          {s.serviceName} — {formatServicePrice(s)}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Items */}
                <h3 style={{marginTop: '1rem', marginBottom: '0.5rem', color: '#374151'}}>
                  {isBulk ? 'Bulk Items (per kg)' : 'Items (per piece)'}
                </h3>

                {isBulk ? (
                  <>
                    {bookingData.items.map((item, index) => (
                      <div key={index} className="bulk-item-grid-row">
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(index, 'category', e.target.value)}
                        >
                          <option value="Clothes">Clothes</option>
                          <option value="Bedding">Bedding</option>
                          <option value="Curtains">Curtains</option>
                          <option value="Towels">Towels</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.weight}
                          onChange={(e) => updateItem(index, 'weight', e.target.value)}
                          placeholder="Weight (kg)"
                        />
                        {bookingData.items.length > 1 && (
                          <button type="button" className="remove-item-btn" onClick={() => removeItemRow(index)}>×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="add-item-btn" onClick={addItem}>Add Item</button>
                  </>
                ) : (
                  <>
                    {bookingData.items.map((item, index) => (
                      <div key={index} className="item-grid-row">
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(index, 'category', e.target.value)}
                        >
                          <option value="Shirt">Shirt</option>
                          <option value="Pants">Pants</option>
                          <option value="Dress">Dress</option>
                          <option value="Saree">Saree</option>
                          <option value="Bedsheet">Bedsheet</option>
                          <option value="Curtains">Curtains</option>
                          <option value="Towel">Towel</option>
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                        />
                        <select
                          value={item.fabric}
                          onChange={(e) => updateItem(index, 'fabric', e.target.value)}
                        >
                          <option value="Cotton">Cotton</option>
                          <option value="Wool">Wool</option>
                          <option value="Silk">Silk</option>
                          <option value="Denim">Denim</option>
                        </select>
                        <select
                          value={item.color}
                          onChange={(e) => updateItem(index, 'color', e.target.value)}
                        >
                          <option value="Whites">Whites</option>
                          <option value="Colors">Colors</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                        {bookingData.items.length > 1 && (
                          <button type="button" className="remove-item-btn" onClick={() => removeItemRow(index)}>×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="add-item-btn" onClick={addItem}>Add Item</button>
                  </>
                )}

                {/* Payment & Notes */}
                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-method-options">
                    <div 
                      className={`payment-method-card ${bookingData.paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
                      onClick={() => {
                        const newData = { ...bookingData, paymentMethod: 'Cash on Delivery' };
                        console.log('💵 CLICKED: Cash on Delivery');
                        console.log('Setting payment method to:', newData.paymentMethod);
                        setAndRecalc(newData);
                      }}
                    >
                      <div className="payment-method-content">
                        <Package size={24} />
                        <span>Cash on Delivery</span>
                        <p className="payment-method-description">Pay when your order is delivered</p>
                      </div>
                      {bookingData.paymentMethod === 'Cash on Delivery' && (
                        <div className="payment-method-selected-icon">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                    <div 
                      className={`payment-method-card ${bookingData.paymentMethod === 'Online Payment' ? 'selected' : ''}`}
                      onClick={() => {
                        const newData = { ...bookingData, paymentMethod: 'Online Payment' };
                        setAndRecalc(newData);
                      }}
                    >
                      <div className="payment-method-content">
                        <CreditCard size={24} />
                        <span>Online Payment</span>
                        <small>Via Stripe</small>
                        <p className="payment-method-description">Secure card payment</p>
                      </div>
                      {bookingData.paymentMethod === 'Online Payment' && (
                        <div className="payment-method-selected-icon">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Payment Method Info */}
                  {bookingData.paymentMethod === 'Cash on Delivery' && (
                    <div className="payment-info-box payment-info-cod">
                      <Package size={16} />
                      <div className="payment-info-content">
                        <strong>Cash on Delivery Selected</strong>
                        <p>You can pay in cash when your order is delivered. Click "Book Now" to confirm your booking directly (no payment popup).</p>
                      </div>
                    </div>
                  )}
                  
                  {bookingData.paymentMethod === 'Online Payment' && (
                    <div className="payment-info-box payment-info-online">
                      <CreditCard size={16} />
                      <div className="payment-info-content">
                        <strong>Online Payment via Stripe</strong>
                        <p>Click "Proceed to Payment" to open the secure payment popup where you can enter your card details.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Special Instructions (optional)</label>
                  <textarea
                    placeholder="Any special instructions..."
                    value={bookingData.notes}
                    onChange={(e) => setAndRecalc({ ...bookingData, notes: e.target.value })}
                    rows="2"
                  />
                </div>

                {/* Estimate */}
                <div className="estimate-card">
                  <div className="estimate-row"><span>Estimated Subtotal:</span><strong>Rs {bookingData.estimate.subtotal.toFixed(2)}</strong></div>
                  <div className="estimate-row"><span>Discount:</span><strong>-Rs {bookingData.estimate.discount.toFixed(2)}</strong></div>
                  <div className="estimate-total"><span>Total:</span><strong>Rs {bookingData.estimate.total.toFixed(2)}</strong></div>
                </div>

                <div className="form-actions">
                  <button 
                    onClick={() => setShowBookingForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitBooking}
                    className="submit-btn"
                    disabled={!bookingData.customerInfo.name || !bookingData.customerInfo.phone || !bookingData.customerInfo.email || !bookingData.customerInfo.address || !bookingData.pickupDate || !bookingData.pickupSlot || bookingData.items.length === 0 || !itemsValid || !bookingData.serviceId}
                  >
                    {bookingData.paymentMethod === 'Online Payment' ? (
                      <>
                        <CreditCard size={18} />
                        Proceed to Payment 💳
                      </>
                    ) : (
                      <>
                        <Package size={18} />
                        Book Now (COD) 💵
                      </>
                    )}
                  </button>
                  
                  {/* Debug Info */}
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Current: <strong>{bookingData.paymentMethod}</strong>
                    {bookingData.paymentMethod === 'Online Payment' && (
                      <div style={{ color: '#3b82f6', fontWeight: '600', marginTop: '0.25rem' }}>
                        ✓ Will open payment modal
                      </div>
                    )}
                    {bookingData.paymentMethod === 'Cash on Delivery' && (
                      <div style={{ color: '#16a34a', fontWeight: '600', marginTop: '0.25rem' }}>
                        ✓ Will process directly (no modal)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CartButton />
      </>
    );
  }

  // Main Providers List (similar to bookings list)
  return (
    <>
      <CustomerNavbar />
      <div className="bookings-page">
        <div className="bookings-main">
          <div className="bookings-header">
            <h1>Find Providers</h1>
            <p>Discover trusted laundry service providers near you</p>
          </div>

          <div className="bookings-container">
            {/* Search and Filter Section */}
            <div className="search-section">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search providers by name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={20} />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="filters-panel">
                <div className="filters-header">
                  <h3>Filters</h3>
                  <button onClick={clearFilters} className="clear-filters">
                    Clear All
                  </button>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="distance">Nearest First</option>
                    <option value="price">Lowest Price</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                  >
                    <option value="0">All Ratings</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Maximum Distance: {filters.maxDistance} km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.maxDistance}
                    onChange={(e) => handleFilterChange('maxDistance', Number(e.target.value))}
                  />
                </div>

                <div className="filter-group">
                  <label>Service Type</label>
                  <select
                    value={filters.serviceType}
                    onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                  >
                    <option value="all">All Services</option>
                    <option value="wash">Wash & Fold</option>
                    <option value="dry-clean">Dry Cleaning</option>
                    <option value="iron">Ironing</option>
                    <option value="express">Express Service</option>
                  </select>
                </div>
              </div>
            )}

            {/* Providers Grid */}
            <div className="providers-grid">
              {providersLoading ? (
                <div className="loading-container">
                  <LoadingSpinner size="large" />
                </div>
              ) : providersError ? (
                <div className="no-bookings">
                  <Package size={48} />
                  <h3>Error Loading Providers</h3>
                  <p>{providersError}</p>
                  <button onClick={() => window.location.reload()} className="btn-clear">
                    Retry
                  </button>
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="no-bookings">
                  <Package size={48} />
                  <h3>No providers found</h3>
                  <p>Try adjusting your search criteria or filters.</p>
                  <button onClick={clearFilters} className="btn-clear">
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredProviders.map(provider => (
                  <div 
                    key={provider.id} 
                    className="provider-card"
                    onClick={() => openServiceTypePicker(provider)}
                  >
                    <div className="provider-image-container">
                      <img 
                        src={provider.image || '/wash1.jpg'} 
                        alt={provider.name}
                        className="provider-card-image"
                        onError={(e) => { e.target.src = '/wash1.jpg'; }}
                      />
                      <div className="provider-status-tag">
                        <span className="status-available">{provider.available ? 'Available' : 'Unavailable'}</span>
                      </div>
                    </div>
                    
                    <div className="provider-card-content">
                      <h3 className="provider-name">{provider.name}</h3>
                      
                      <div className="provider-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            fill={star <= Math.floor(provider.rating) ? "#fbbf24" : "none"}
                            color="#fbbf24"
                          />
                        ))}
                        <span>
                          {provider.rating > 0 
                            ? `${provider.rating.toFixed(1)} (${provider.reviews} reviews)` 
                            : 'No reviews yet'}
                        </span>
                      </div>
                      
                      <p className="provider-description">
                        {provider.description.length > 100 
                          ? provider.description.substring(0, 100) + "..." 
                          : provider.description
                        }
                      </p>
                      
                      <div className="provider-details">
                        <div className="provider-detail-item">
                          <MapPin size={14} />
                          <span>{provider.distance} km</span>
                        </div>
                        <div className="provider-detail-item">
                          <Package size={14} />
                          <span>Rs {provider.priceRange}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <CartButton />
    </>
  );
};

export default Providers;