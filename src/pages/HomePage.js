import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import JobsListing from '../components/JobsListing';
import Team from '../components/Team';
import TrustedCompanies from '../components/TrustedCompanies';

const HomePage = ({ onJobRequestClick }) => {
  return (
    <div>
      <Hero />
      <Features />
      <JobsListing />
      <TrustedCompanies />
      <Team onJobRequestClick={onJobRequestClick} />
    </div>
  );
};

export default HomePage;
