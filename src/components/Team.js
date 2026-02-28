import React from 'react';
import { teamData } from '../data/jobsData';

const Team = () => {
  return (
    <section className="team sec-space obj-width">
      <h2>Highest Rated Team</h2>
      <p>Find some of the best professionals in the industry.</p>

      <div className="team-container">
        {teamData.map((member) => (
          <div key={member.id} className="fl-box">
            <img src={member.image} alt={member.name} />
            <h3>{member.name}</h3>
            <div className="skill">
              {member.skills.map((skill, index) => (
                <span key={index}>{skill}</span>
              ))}
            </div>
            <a href="/" id="g-btn" className="hire-btn" onClick={(e) => e.preventDefault()}>
              View Profile
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Team;
