import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Search, MapPin, Clock, Shield, Star, TrendingUp } from 'lucide-react';
import './Home.css';
import searchImage from "/search4.jpg";

const Home = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const handleVideoClick = (e) => {
    const video = e.target;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const steps = [
    {
      number: '1',
      title: 'Search Providers',
      description: 'Find laundry service providers near you'
    },
    {
      number: '2',
      title: 'Compare & Choose',
      description: 'Compare prices, ratings, and services'
    },
    {
      number: '3',
      title: 'Book Service',
      description: 'Schedule pickup time and service type'
    },
    {
      number: '4',
      title: 'Track & Receive',
      description: 'Track your order and receive clean laundry'
    }
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Laundry, <span className="highlight">Simplified</span>
          </h1>
          <p className="hero-subtitle">
            Connect with trusted laundry service providers. Compare, book, and track your orders all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/providers" className="btn-hero-primary">
              Find Providers
            </Link>
            <Link to="/how-it-works" className="btn-hero-secondary">
              Learn More
            </Link>
          </div>
          <div className="hero-stats-updated">
            <div className="stat-item-updated">
              <div className="stat-number-updated">500+</div>
              <div className="stat-label-updated">Verified Providers</div>
            </div>
            <div className="stat-item-updated">
              <div className="stat-number-updated">10K+</div>
              <div className="stat-label-updated">Happy Customers</div>
            </div>
            <div className="stat-item-updated">
              <div className="stat-number-updated">4.8</div>
              <div className="stat-label-updated">Average Rating</div>
            </div>
          </div>
        </div>
        <div className="hero-video-frame">
          <video 
            className="hero-video"
            src="/video1.mp4" 
            autoPlay
            loop
            muted 
            playsInline
            onClick={handleVideoClick}
            style={{ cursor: 'pointer' }}
          />
          {!isPlaying && (
            <div className="video-play-overlay">
              <div className="video-play-icon">▶</div>
            </div>
          )}
        </div>
      </section>

      <section className="image-section">
        <div className="image-container">
          <img src={searchImage} alt="Search Providers" className="search-image" />
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get your laundry done in 4 simple steps</p>
          
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers using WashX</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta">
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      <section className="provider-cta-section">
        <div className="provider-cta-container">
          <div className="provider-cta-content">
            <h2>Are you a Laundry Service Provider?</h2>
            <p>Grow your business by joining our platform</p>
            <ul className="provider-benefits">
              <li>
                <TrendingUp size={24} />
                <span>Reach more customers</span>
              </li>
              <li>
                <Star size={24} />
                <span>Build your reputation</span>
              </li>
              <li>
                <Shield size={24} />
                <span>Secure payments</span>
              </li>
            </ul>
            <Link to="/provider/register" className="btn-provider">
              Register as Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
