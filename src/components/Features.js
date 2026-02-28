import React from 'react';
import { featuresData } from '../data/jobsData';

const Features = () => {
  return (
    <section className="features sec-space obj-width">
      <h2>Need something?</h2>
      <p>Find the perfect job for you with Alacritas.</p>

      <div className="fe-box">
        {featuresData.map((feature) => (
          <div key={feature.id}>
            <img src={feature.icon} alt={feature.title} />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
