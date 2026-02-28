import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all fields');
      return;
    }

    // TODO: Connect to Firebase to save contact message
    console.log('Contact form submitted:', formData);
    
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <section className="contact-section extra-space obj-width">
      <div className="contact-container">
        <div className="contact-info">
          <h1>Get in Touch</h1>
          <p>Have questions about Alacritas? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

          <div className="contact-details">
            <div className="contact-item">
              <i className="bx bx-map"></i>
              <div>
                <h3>Address</h3>
                <p>123 Main Street<br />Anytown, USA</p>
              </div>
            </div>

            <div className="contact-item">
              <i className="bx bx-phone"></i>
              <div>
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="contact-item">
              <i className="bx bx-envelope"></i>
              <div>
                <h3>Email</h3>
                <p>info@alacritas.com</p>
              </div>
            </div>

            <div className="contact-item">
              <i className="bx bx-time-five"></i>
              <div>
                <h3>Hours</h3>
                <p>Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: Closed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          {submitted ? (
            <div style={{
              padding: '2rem',
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              color: '#155724',
              textAlign: 'center',
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div>
                <h3>✓ Message Sent Successfully!</h3>
                <p>Thank you for contacting us. We'll get back to you soon.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Your message here..."
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
