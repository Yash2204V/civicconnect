import { motion } from 'framer-motion';
import { Cookie, Settings, Shield, Info } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 text-white">
      {/* Hero Section */}
      <Header />
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <img
            src="https://images.pexels.com/photos/4267623/pexels-photo-4267623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Cookie Policy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6 text-gradient-primary"
          >
            Cookie Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto text-gray-300"
          >
            Understanding how we use cookies to improve your experience
          </motion.p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-xl backdrop-blur-lg border border-gray-700 hover:border-gray-600 transition-all"
        >
          <div className="space-y-12 bg-gray-950 bg-opacity-90 p-8 rounded-xl">
            {/* What Are Cookies? */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                  <Cookie className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">What Are Cookies?</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remembering your preferences and settings</li>
                  <li>Maintaining your session while logged in</li>
                  <li>Understanding how you use our platform</li>
                  <li>Improving our services based on your behavior</li>
                </ul>
              </div>
            </section>

            {/* Types of Cookies We Use */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Types of Cookies We Use</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <h3 className="text-xl font-semibold">Essential Cookies</h3>
                <p>Required for the platform to function properly. These cannot be disabled.</p>
                
                <h3 className="text-xl font-semibold mt-6">Functional Cookies</h3>
                <p>Enhance your experience by remembering your preferences.</p>
                
                <h3 className="text-xl font-semibold mt-6">Analytics Cookies</h3>
                <p>Help us understand how visitors interact with our platform.</p>
                
                <h3 className="text-xl font-semibold mt-6">Performance Cookies</h3>
                <p>Collect information about platform performance and potential issues.</p>
              </div>
            </section>

            {/* Cookie Management */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Cookie Management</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>You can manage your cookie preferences by:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Adjusting your browser settings to block or delete cookies</li>
                  <li>Using our cookie preference center</li>
                  <li>Opting out of non-essential cookies</li>
                </ul>
                <p className="mt-4">
                  Please note that blocking some types of cookies may impact your experience on our platform.
                </p>
              </div>
            </section>

            {/* Additional Information */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-pink-600 to-red-600 p-3 rounded-lg">
                  <Info className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Additional Information</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
                </p>
                <p>
                  For more information about how we protect your privacy, please refer to our Privacy Policy.
                </p>
              </div>
            </section>
          </div>

        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default CookiePolicy;