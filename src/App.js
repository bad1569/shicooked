import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import SignupModal from './components/SignupModal';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { JobsProvider } from './context/JobsContext';

function App() {
  const [showSignup, setShowSignup] = useState(false);

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleSignupClose = () => {
    setShowSignup(false);
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
  };

  return (
    <Router>
      <AuthProvider>
        <JobsProvider>
          <div className="App">
            <Header onSignupClick={handleSignupClick} />
            <SignupModal
              isOpen={showSignup}
              onClose={handleSignupClose}
              onSignupSuccess={handleSignupSuccess}
            />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/job-details/:id" element={<JobDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/contact" element={<ContactPage />} />
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
