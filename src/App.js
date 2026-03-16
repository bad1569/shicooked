import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './styles/global.css';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import SignupModal from './components/SignupModal';
import AdminLoginModal from './components/AdminLoginModal';
import JobRequestModal from './components/JobRequestModal';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import JobApplicationPage from './pages/JobApplicationPage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import NotificationsPage from './pages/NotificationsPage';
import JobRequestsPage from './pages/JobRequestsPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import { JobsProvider } from './context/JobsContext';

function App() {
  const [showSignup, setShowSignup] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showJobRequest, setShowJobRequest] = useState(false);

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleSignupClose = () => {
    setShowSignup(false);
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
  };

  const handleAdminLoginClick = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLoginClose = () => {
    setShowAdminLogin(false);
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    window.location.href = '/admin';
  };

  const handleJobRequestClick = () => {
    setShowJobRequest(true);
  };

  const handleJobRequestClose = () => {
    setShowJobRequest(false);
  };

  const handleJobRequestSuccess = () => {
    setShowJobRequest(false);
    window.location.href = '/my-requests';
  };

  return (
    <Router>
      <AuthProvider>
        <JobsProvider>
          <div className="App">
            <Header 
              onSignupClick={handleSignupClick}
              onAdminLoginClick={handleAdminLoginClick}
            />
            <SignupModal
              isOpen={showSignup}
              onClose={handleSignupClose}
              onSignupSuccess={handleSignupSuccess}
            />
            <AdminLoginModal
              isOpen={showAdminLogin}
              onClose={handleAdminLoginClose}
              onSuccess={handleAdminLoginSuccess}
            />
            <JobRequestModal
              isOpen={showJobRequest}
              onClose={handleJobRequestClose}
              onSuccess={handleJobRequestSuccess}
            />
            <Routes>
              <Route path="/" element={<HomePage onJobRequestClick={handleJobRequestClick} />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/job-details/:id" element={<JobDetailsPage />} />
              <Route path="/apply/:id" element={<JobApplicationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/my-requests" element={<JobRequestsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
            <Footer />
          </div>
        </JobsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
