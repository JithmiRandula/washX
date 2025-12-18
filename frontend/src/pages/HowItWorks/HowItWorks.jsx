
import './HowItWorks.css';

// Vite/React: import image for correct path resolution
import wash1 from '/wash3.jpg';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Find Providers',
      description: 'Search for laundry service providers near you using our location-based search. Compare prices, ratings, and services offered.',
      icon: '🔍'
    },
    {
      number: '2',
      title: 'Choose Your Service',
      description: 'Select the services you need - wash & fold, dry cleaning, ironing, or premium care. Review pricing and available time slots.',
      icon: '✅'
    },
    {
      number: '3',
      title: 'Schedule Pickup',
      description: 'Choose a convenient pickup time and location. Our partner will collect your laundry at the scheduled time.',
      icon: '📅'
    },
    {
      number: '4',
      title: 'Track Your Order',
      description: 'Monitor your laundry status in real-time - from pickup to washing, drying, and quality check.',
      icon: '📍'
    },
    {
      number: '5',
      title: 'Receive Clean Laundry',
      description: 'Get your freshly cleaned and neatly packed laundry delivered to your doorstep at the chosen time.',
      icon: '🎁'
    },
    {
      number: '6',
      title: 'Review & Earn Points',
      description: 'Rate your experience and earn loyalty points for future discounts. Your feedback helps others choose the best service.',
      icon: '⭐'
    }
  ];

  return (
    <div
      className="how-it-works-page"
      style={{
        background: `url(${wash1}) center/cover no-repeat fixed`
      }}
    >
      <div className="how-header">
        <h1>How WashX Works</h1>
        <p>Get your laundry done in 6 simple steps</p>
      </div>

      <div className="how-container">
        <div className="steps-bg">
          <div className="steps-list">
            {steps.map((step, index) => (
              <div key={index} className="simple-step">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
          <div className="cta-section">
            <h2>Ready to Experience Hassle-Free Laundry?</h2>
            <p>Join thousands of satisfied customers today</p>
            <div className="cta-buttons">
              <a href="/register" className="btn-cta">Get Started</a>
              <a href="/providers" className="btn-cta-outline">Browse Providers</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
