import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/jobs');
  };

  return (
    <section className="hero">
      <div className="hero-box obj-width">
        <div className="h-left">
          <h1>
            Discover Opportunities <br />
            That Match Your Skills
          </h1>
          <p>
            Work with top companies and <br />
            grow your career with Alacritas
          </p>
          <div className="search-bar">
            <input type="text" placeholder="Search for jobs..." />
            <a id="g-btn" href="/" onClick={handleSearch}>
              Search
            </a>
          </div>
        </div>

        <div className="h-right">
          <img src="/images/sourced/hero2.png" alt="Professional opportunities" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
