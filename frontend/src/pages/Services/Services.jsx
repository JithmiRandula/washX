import './Services.css';

const Services = () => {
  const services = [
    {
      title: 'Wash & Fold',
      description: 'Professional washing and folding service for your everyday laundry needs',
      price: 'From $12/kg',
      features: ['Deep cleaning', 'Fresh scent', 'Neatly folded', 'Same-day available']
    },
    {
      title: 'Dry Cleaning',
      description: 'Expert dry cleaning for delicate and special garments',
      price: 'From $25/item',
      features: ['Gentle on fabrics', 'Professional care', 'Stain removal', 'Pressed finish']
    },
    {
      title: 'Ironing Service',
      description: 'Crisp and wrinkle-free clothes, professionally pressed',
      price: 'From $8/kg',
      features: ['Expert pressing', 'Crease-free', 'Quick turnaround', 'Hanger service']
    },
    {
      title: 'Steam Press',
      description: 'Deep steam pressing for formal wear and delicate fabrics',
      price: 'From $20/item',
      features: ['Sanitization', 'Odor removal', 'Gentle process', 'Premium finish']
    },
    {
      title: 'Premium Care',
      description: 'Specialized care for luxury and designer garments',
      price: 'From $35/item',
      features: ['Hand washing', 'Air drying', 'Custom care', 'Quality assured']
    },
    {
      title: 'Express Service',
      description: 'Fast turnaround for urgent laundry needs',
      price: '+50% surcharge',
      features: ['1-2 hour service', 'Priority handling', 'Available 24/7', 'Rush delivery']
    }
  ];

  return (
    <div className="services-main-page">
      <div className="services-page-header">
        <h1>Our Services</h1>
        <p>Professional laundry care for all your needs</p>
      </div>

      {/* 7 Images in a Horizontal Row, Each with Own Wave SVG Behind */}
      <div className="services-nft-images-row">
        <div className="services-nft-images-row-inner">
          {[
            'card1.jpg',
            'card2.jpg',
            'card3.jpg',
            'card4.jpg',
            'card5.jpg',
            'card6.jpg',
            'card7.jpg',
            'card8.jpg',
          ].map((img, idx) => (
            <div
              key={idx}
              className="services-nft-image-card"
              style={{
                position: 'relative',
                zIndex: 1,
                marginTop: idx % 2 === 0 ? '0px' : '40px',
              }}
            >
              {/* Gradient overlay */}
              <div className="services-nft-image-gradient" />
              {/* Individual wave for each image */}
              <svg
                viewBox="0 0 300 40"
                preserveAspectRatio="none"
                className="services-wave-svg"
                style={{
                  position: 'absolute',
                  top: idx % 2 === 0 ? '80%' : '60%',
                  left: 0,
                  width: '100%',
                  height: '40px',
                  zIndex: 0,
                }}
              >
                <path
                  d="M0,20 C75,40 225,0 300,20 L300,40 L0,40 Z"
                  fill="#6ec6f2"
                  opacity="0.7"
                />
              </svg>
              <img src={img} alt="NFT" className="services-nft-image-only" style={{ position: 'relative', zIndex: 1 }} />
            </div>
          ))}
          {/* Duplicate for infinite effect */}
          {[
            'card1.jpg',
            'card2.jpg',
            'card3.jpg',
            'card4.jpg',
            'card5.jpg',
            'card6.jpg',
            'card7.jpg',
            'card8.jpg',
          ].map((img, idx) => (
            <div
              key={"dup-" + idx}
              className="services-nft-image-card"
              style={{
                position: 'relative',
                zIndex: 1,
                marginTop: idx % 2 === 0 ? '0px' : '40px',
              }}
            >
              <div className="services-nft-image-gradient" />
              <svg
                viewBox="0 0 300 40"
                preserveAspectRatio="none"
                className="services-wave-svg"
                style={{
                  position: 'absolute',
                  top: idx % 2 === 0 ? '80%' : '60%',
                  left: 0,
                  width: '100%',
                  height: '40px',
                  zIndex: 0,
                }}
              >
                <path
                  d="M0,20 C75,40 225,0 300,20 L300,40 L0,40 Z"
                  fill="#6ec6f2"
                  opacity="0.7"
                />
              </svg>
              <img src={img} alt="NFT" className="services-nft-image-only" style={{ position: 'relative', zIndex: 1 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ...existing code... */}
      <div className="services-main-container">
        <div className="services-modern-grid">
          {services.map((service, index) => (
            <div key={index} className="services-modern-card">
              <div className="services-modern-header">
                <div className="services-modern-title">{service.title}</div>
                <div className="services-modern-price-badge">
                  <span className="services-modern-price-value">{service.price.replace('$', 'Rs ')}</span>
                </div>
              </div>
              <div className="services-modern-description">{service.description}</div>
              <ul className="services-modern-features">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="services-modern-feature-item">
                    <span className="services-modern-feature-check">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
