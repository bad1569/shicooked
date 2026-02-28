import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import JobsListing from '../components/JobsListing';
import Team from '../components/Team';
import TrustedCompanies from '../components/TrustedCompanies';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <Features />
      <JobsListing />
      <TrustedCompanies />
      <Team />
    </div>
  );
};

export default HomePage;
