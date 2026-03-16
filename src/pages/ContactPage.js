import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../config/firebase';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      
      // Save contact message to Firebase database for customer service
      const contactRef = ref(db, 'contactMessages');
      await push(contactRef, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        timestamp: new Date().toISOString(),
        status: 'new'
      });
      
      console.log(
        '%c✅ Contact message saved to database',
        'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;',
        formData
      );
      
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('Error saving contact message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
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
                <p>Unit 206, Tech Tower Manila<br />Makati, Metro Manila, Philippines</p>
              </div>
            </div>

            <div className="contact-item">
              <i className="bx bx-phone"></i>
              <div>
                <h3>Phone</h3>
                <p>+63 (2) 8123-4567</p>
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
                <p>Mon - Fri: 8:00 AM - 5:00 PM (PST)<br />Sat - Sun: Closed</p>
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
            <>
              {error && (
                <div style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '6px',
                  background: '#f8d7da',
                  color: '#721c24',
                  border: '1px solid #f5c6cb',
                  fontSize: '0.95rem'
                }}>
                  {error}
                </div>
              )}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
