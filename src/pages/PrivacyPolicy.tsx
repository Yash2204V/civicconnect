import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 text-white">
      {/* Hero Section */}
      <Header />
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <img
            src="https://images.pexels.com/photos/13062237/pexels-photo-13062237.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Privacy Policy"
            className="w-full h-full object-cover object-center transform-gpu scale-100 contrast-125 brightness-75"
          />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6 text-gradient-primary"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto text-gray-300"
          >
            Your privacy is our top priority
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
            {/* Information We Collect */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Personal identification information (Name, email address, phone number)</li>
                  <li>Location data for incident reporting</li>
                  <li>Information about reported incidents</li>
                  <li>Communication records between you and our platform</li>
                </ul>
              </div>
            </section>

            {/* How We Protect Your Data */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">How We Protect Your Data</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>We implement strict security measures to protect your information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>End-to-end encryption for all sensitive data</li>
                  <li>Regular security audits and updates</li>
                  <li>Restricted access to personal information</li>
                  <li>Secure data storage and transmission</li>
                </ul>
              </div>
            </section>

            {/* Data Usage */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Data Usage</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>Your information is used for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Processing and responding to reported incidents</li>
                  <li>Communicating updates about your reports</li>
                  <li>Improving our services and user experience</li>
                  <li>Legal compliance and law enforcement cooperation</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-pink-600 to-red-600 p-3 rounded-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Your Rights</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal data</li>
                  <li>Request data correction or deletion</li>
                  <li>Opt-out of non-essential communications</li>
                  <li>File a complaint with relevant authorities</li>
                </ul>
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;