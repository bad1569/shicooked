import React from 'react';
import { trustedCompanies } from '../data/jobsData';

const TrustedCompanies = () => {
  return (
    <section className="trust sec-space obj-width">
      <h2>Trusted by top companies</h2>
      <p>Work with industry leaders and Fortune 500 companies.</p>

      <div className="t-box">
        {trustedCompanies.map((company) => (
          <img
            key={company.id}
            src={company.image}
            alt={`Company ${company.id}`}
          />
        ))}
      </div>
    </section>
  );
};

export default TrustedCompanies;
