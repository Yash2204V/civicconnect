import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import HowItWorks from './pages/HowItWorks';
import SuccessStories from './pages/SuccessStories';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import { motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { ParallaxProvider } from 'react-scroll-parallax';

function App() {
  return (
    <ParallaxProvider>
      <AuthProvider>
        <PostProvider>
          <Router>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/indiancops-login" element={<AdminLogin />} />
                <Route path="/indiancops" element={<AdminPanel />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </motion.div>
          </Router>
        </PostProvider>
      </AuthProvider>
    </ParallaxProvider>
  );
}

export default App;