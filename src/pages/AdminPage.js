import React, { useState } from 'react';
import { useJobs } from '../context/JobsContext';

const AdminPage = () => {
  const { jobs, addJob } = useJobs();
  const [formData, setFormData] = useState({
    title: '',
    rate: '',
    type: 'Fulltime',
    companyName: '',
    location: '',
    vacancy: '',
    hours: '',
    description: '',
    workplace: 'On-site',
    education: '',
    experience: '',
    skills: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.companyName || !formData.location) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }

    const newJob = {
      index: jobs.length,
      icon: getIconForJob(formData.title),
      image: getImageForJob(formData.title),
      title: formData.title,
      rate: formData.rate,
      type: formData.type,
      companyName: formData.companyName,
      location: formData.location,
      vacancy: formData.vacancy,
      hours: formData.hours,
      description: formData.description,
      workplace: formData.workplace,
      education: formData.education,
      experience: formData.experience,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
    };

    try {
      addJob(newJob);
      setMessage({ text: 'Job added successfully!', type: 'success' });
      setFormData({
        title: '',
        rate: '',
        type: 'Fulltime',
        companyName: '',
        location: '',
        vacancy: '',
        hours: '',
        description: '',
        workplace: 'On-site',
        education: '',
        experience: '',
        skills: ''
      });
      setTimeout(() => setShowForm(false), 2000);
    } catch (err) {
      setMessage({ text: 'Error adding job: ' + err.message, type: 'error' });
    }
  };

  const getIconForJob = (title) => {
    const icons = {
      electrician: '⚡',
      plumbing: '🔧',
      carpentry: '🪛',
      welding: '🔥',
      mechanical: '⚙️',
      default: '💼'
    };
    const titleLower = title.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (titleLower.includes(key)) return icon;
    }
    return icons.default;
  };

  const getImageForJob = (title) => {
    const images = {
      electrician: '/images/sourced/electrical.png',
      plumbing: '/images/sourced/plumming.png',
      carpentry: '/images/sourced/carpentry.png',
      welding: '/images/sourced/smaw.png',
      mechanical: '/images/sourced/machine.png',
      default: '/images/sourced/logo.png'
    };
    const titleLower = title.toLowerCase();
    for (const [key, image] of Object.entries(images)) {
      if (titleLower.includes(key)) return image;
    }
    return images.default;
  };

  return (
    <section className="admin-section extra-space obj-width">
      <div className="admin-container">
        <h1>Admin Panel</h1>
        <p>Manage job listings for Alacritas</p>

        <div className="admin-content">
          <div className="jobs-list">
            <h2>Current Jobs ({jobs.length})</h2>
            
            <button 
              className="add-job-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Close Form' : '+ Add New Job'}
            </button>

            {message.text && (
              <div style={{
                padding: '1rem',
                marginTop: '1rem',
                borderRadius: '6px',
                background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {message.text}
              </div>
            )}

            <div className="jobs-table-container">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Rate</th>
                    <th>Vacancy</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img src={job.image} alt={job.title} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                          {job.title}
                        </div>
                      </td>
                      <td>{job.companyName}</td>
                      <td>{job.location}</td>
                      <td><span className="badge">{job.type}</span></td>
                      <td>{job.rate}</td>
                      <td>{job.vacancy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showForm && (
            <div className="add-job-form-container">
              <h2>Add New Job</h2>
              
              <form onSubmit={handleSubmit} className="add-job-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Job Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="e.g., Electrician"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      placeholder="e.g., Company Name"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="e.g., New York, USA"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rate">Salary Rate</label>
                    <input
                      type="text"
                      id="rate"
                      name="rate"
                      placeholder="e.g., $800-1500/m"
                      value={formData.rate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Job Type</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="Fulltime">Full Time</option>
                      <option value="Parttime">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="vacancy">Vacancy</label>
                    <input
                      type="number"
                      id="vacancy"
                      name="vacancy"
                      placeholder="Number of positions"
                      value={formData.vacancy}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="hours">Hours/Week</label>
                    <input
                      type="text"
                      id="hours"
                      name="hours"
                      placeholder="e.g., 40-50h/week"
                      value={formData.hours}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="workplace">Workplace</label>
                    <select
                      id="workplace"
                      name="workplace"
                      value={formData.workplace}
                      onChange={handleChange}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="education">Education Requirement</label>
                    <input
                      type="text"
                      id="education"
                      name="education"
                      placeholder="e.g., Trade Certification"
                      value={formData.education}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experience Required</label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      placeholder="e.g., 3+ years"
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Job Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Detailed job description..."
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="skills">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    placeholder="e.g., Wiring, Circuit Installation, Safety"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">Add Job</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminPage;
