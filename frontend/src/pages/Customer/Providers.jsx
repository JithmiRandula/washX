import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getProviders } from '../../utils/api';
import ProviderCard from '../../components/ProviderCard/ProviderCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Providers.css';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'rating',
    minRating: 0,
    maxDistance: 50,
    serviceType: 'all'
  });

  useEffect(() => {
    loadProviders();
  }, [filters]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await getProviders(filters);
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="providers-page">
      <div className="providers-header">
        <h1>Find Laundry Providers</h1>
        <p>Compare and choose from verified laundry service providers near you</p>
      </div>

      <div className="providers-container">
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
                <option value="steam">Steam Press</option>
              </select>
            </div>
          </div>
        )}

        <div className="providers-results">
          <div className="results-header">
            <p>{providers.length} providers found</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <LoadingSpinner size="large" />
            </div>
          ) : providers.length === 0 ? (
            <div className="no-results">
              <p>No providers found matching your criteria</p>
              <button onClick={clearFilters} className="btn-clear">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="providers-grid">
              {providers.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Providers;
