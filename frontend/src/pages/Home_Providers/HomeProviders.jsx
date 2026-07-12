import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProvidersPopup from '../../components/ProvidersPopup/ProvidersPopup';
import Navbar from '../../components/Navbar/Navbar';
import { Search, MapPin, Star, Package, Calendar, Navigation } from 'lucide-react';
import api from '../../utils/api';
import './HomeProviders.css';

const GOOGLE_MAPS_KEY = 'AIzaSyCrL0PgpDatU3sg52bhdK_vSWcdD_IatiI';

// Haversine formula — returns distance in km between two GPS points
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const HomeProviders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Raw providers from API (with lat/lng intact)
  const [rawProviders, setRawProviders] = useState([]);
  // Providers shown in UI (with computed distances)
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Customer's GPS location (set after popup)
  const [userLocation, setUserLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [showPopup, setShowPopup] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    distance: 50,
    minRating: 0,
    serviceType: 'all',
    sortBy: 'rating', // switches to 'distance' once location is known
  });

  // ── 1. Fetch real providers from backend ──────────────────────────────────
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        const [providersRes, ratingsRes] = await Promise.all([
          api.get('/providers/with-services'),
          api.get('/reviews/all-ratings').catch(() => ({ data: { data: [] } })),
        ]);

        if (!providersRes.data?.success) {
          setError('Failed to load providers.');
          return;
        }

        // Build fast ratings lookup: { providerId -> { rating, reviews } }
        const ratingsMap = {};
        (ratingsRes.data?.data || []).forEach((r) => {
          const pid = r.providerId ?? r.ProviderId;
          ratingsMap[pid] = {
            rating: Number(r.averageRating ?? r.AverageRating ?? 0),
            reviews: Number(r.totalReviews ?? r.TotalReviews ?? 0),
          };
        });

        const transformed = (providersRes.data.data || []).map((p) => {
          const services = Array.isArray(p.services) ? p.services : [];
          const serviceNames = services.map((s) => s?.serviceName).filter(Boolean);
          const prices = services.map((s) => Number(s?.price)).filter(Number.isFinite);
          const ratingData = ratingsMap[Number(p.providerId)] ?? { rating: 0, reviews: 0 };

          return {
            id: p.providerId,
            name: p.businessName || 'Unnamed Provider',
            rating: ratingData.rating,
            reviews: ratingData.reviews,
            address: p.businessAddress || '',
            description: p.description || '',
            lat: p.latitude != null ? Number(p.latitude) : null,
            lng: p.longitude != null ? Number(p.longitude) : null,
            distance: null,  // computed after GPS
            services: serviceNames,
            minPrice: prices.length ? Math.min(...prices) : null,
            isVerified: Boolean(p.isVerified),
          };
        });

        setRawProviders(transformed);
        setProviders(transformed);
      } catch (err) {
        setError('Unable to load providers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // ── 2. Recompute distances whenever location or raw list changes ──────────
  const applyLocation = useCallback(
    (loc) => {
      const withDistance = rawProviders.map((p) => ({
        ...p,
        distance:
          p.lat != null && p.lng != null
            ? Math.round(haversineKm(loc.lat, loc.lng, p.lat, p.lng) * 10) / 10
            : null,
      }));
      setProviders(withDistance);
      setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
    },
    [rawProviders]
  );

  useEffect(() => {
    if (userLocation && rawProviders.length > 0) {
      applyLocation(userLocation);
    }
  }, [userLocation, rawProviders, applyLocation]);

  // ── 3. GPS handler passed to ProvidersPopup ───────────────────────────────
  const handleUseCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const loc = { lat: latitude, lng: longitude };

          // Reverse-geocode with Google Maps API
          let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          try {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'OK' && data.results?.[0]?.formatted_address) {
                address = data.results[0].formatted_address;
              }
            }
          } catch (_) {}

          setUserLocation(loc);
          setLocationAddress(address);
          setShowPopup(false);
          resolve();
        },
        () => reject(new Error('Unable to get location. Please check your browser permissions.')),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

  // ── 4. Filter + sort ──────────────────────────────────────────────────────
  const filteredProviders = providers
    .filter((p) => {
      if (
        filters.search &&
        !p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !p.address.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (filters.distance < 50 && p.distance != null && p.distance > filters.distance)
        return false;
      if (
        filters.serviceType !== 'all' &&
        !p.services.some((s) => s.toLowerCase().includes(filters.serviceType.toLowerCase()))
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'distance') {
        if (a.distance == null && b.distance == null) return b.rating - a.rating;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      }
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'reviews') return b.reviews - a.reviews;
      return 0;
    });

  const handleBookOrder = (providerId) => {
    navigate('/register', {
      state: {
        message: 'Please register or login to book an order',
        returnTo: `/providers/${providerId}`,
      },
    });
  };

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="home-providers-page">
      <Navbar />

      {/* Location popup — shown until GPS is granted */}
      {showPopup && (
        <ProvidersPopup
          onClose={setShowPopup}
          onUseCurrentLocation={handleUseCurrentLocation}
        />
      )}

      <div className="home-providers-body">
      <div className="home-providers-container">

        {/* Header */}
        <div className="home-providers-header">
          <div className="home-header-content">
            <h1>Find Laundry Providers</h1>
            <p>
              {userLocation
                ? `Showing providers near: ${locationAddress}`
                : 'Discover reliable laundry services near you'}
            </p>
          </div>

          <div className="home-results-info">
            <span className="home-count-badge">
              {loading ? '…' : `${filteredProviders.length} provider${filteredProviders.length !== 1 ? 's' : ''} found`}
            </span>
            {!userLocation && !showPopup && (
              <button className="home-use-loc-btn" onClick={() => setShowPopup(true)}>
                <Navigation size={14} /> Use My Location
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="home-providers-filters">
          <div className="home-search-section">
            <div className="home-search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          <div className="home-filter-section">
            <div className="home-filter-group">
              <label>Distance (KM)</label>
              <select
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', Number(e.target.value))}
              >
                <option value={50}>All Distances</option>
                <option value={1}>Within 1 KM</option>
                <option value={3}>Within 3 KM</option>
                <option value={5}>Within 5 KM</option>
                <option value={10}>Within 10 KM</option>
                <option value={20}>Within 20 KM</option>
              </select>
            </div>

            <div className="home-filter-group">
              <label>Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            <div className="home-filter-group">
              <label>Service Type</label>
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              >
                <option value="all">All Services</option>
                <option value="wash">Wash &amp; Fold</option>
                <option value="dry">Dry Cleaning</option>
                <option value="iron">Ironing Service</option>
                <option value="express">Express Service</option>
                <option value="premium">Premium Care</option>
              </select>
            </div>

            <div className="home-filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="reviews">Reviews</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="home-loading">
            <div className="home-spinner" />
            <p>Loading providers…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="home-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}

        {/* Provider grid */}
        {!loading && !error && filteredProviders.length > 0 && (
          <div className="home-providers-grid">
            {filteredProviders.map((provider) => {
              const isNear = provider.distance != null && provider.distance <= 5;
              return (
                <div key={provider.id} className="home-provider-card">

                  {/* Image + badges */}
                  <div className="home-provider-image">
                    <img
                      src="/wash1.jpg"
                      alt={provider.name}
                      onError={(e) => { e.target.src = '/wash1.jpg'; }}
                    />
                    <div className={`home-distance-badge${isNear ? ' home-distance-near' : ''}`}>
                      <MapPin size={12} />
                      {provider.distance != null ? `${provider.distance} km` : '— km'}
                    </div>
                    {isNear && (
                      <div className="home-nearby-badge">Nearby</div>
                    )}
                    {provider.isVerified && (
                      <div className="home-verified-badge">✓ Verified</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="home-provider-content">
                    <div className="home-provider-header">
                      <h3>{provider.name}</h3>
                      <div className="home-rating">
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}</span>
                        {provider.reviews > 0 && (
                          <span className="home-reviews">({provider.reviews})</span>
                        )}
                      </div>
                    </div>

                    {provider.address && (
                      <div className="home-address">
                        <MapPin size={13} />
                        <span>{provider.address}</span>
                      </div>
                    )}

                    {provider.description && (
                      <p className="home-description">
                        {provider.description.length > 100
                          ? provider.description.slice(0, 100) + '…'
                          : provider.description}
                      </p>
                    )}

                    {provider.services.length > 0 && (
                      <div className="home-services">
                        {provider.services.slice(0, 3).map((s, i) => (
                          <span key={i} className="home-service-tag">
                            <Package size={11} /> {s}
                          </span>
                        ))}
                        {provider.services.length > 3 && (
                          <span className="home-service-tag home-more">
                            +{provider.services.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {provider.minPrice != null && (
                      <div className="home-pricing-row">
                        <span>Starting from</span>
                        <span className="home-price-val">Rs {Math.round(provider.minPrice)}</span>
                      </div>
                    )}

                    <button
                      className="home-book-order-btn"
                      onClick={() => handleBookOrder(provider.id)}
                    >
                      <Calendar size={15} />
                      Register to Book
                    </button>

                    {!isAuthenticated && (
                      <p className="home-auth-notice">
                        Register or login to place an order
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProviders.length === 0 && (
          <div className="home-no-providers">
            <Package size={48} />
            <h3>No providers found</h3>
            <p>Try adjusting your search criteria or expanding the distance range.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default HomeProviders;
