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
    <div className="services-page">
      <div className="services-header">
        <h1>Our Services</h1>
        <p>Professional laundry care for all your needs</p>
      </div>

      <div className="services-container">
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-header">
                <h3>{service.title}</h3>
                <span className="service-price">{service.price}</span>
              </div>
              <p className="service-description">{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
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
