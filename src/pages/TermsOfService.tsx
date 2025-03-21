import { motion } from 'framer-motion';
import { FileText, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 text-white">
      {/* Hero Section */}
      <Header />
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <img
            src="https://images.pexels.com/photos/4496624/pexels-photo-4496624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Terms of Service"
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
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto text-gray-300"
          >
            Please read these terms carefully before using our service
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
            {/* Agreement to Terms */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Agreement to Terms</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  By accessing or using 109Cops, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">User Responsibilities</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>As a user of 109Cops, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and truthful information when reporting incidents</li>
                  <li>Not misuse the platform for false reporting or harassment</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not interfere with the platform's security features</li>
                </ul>
              </div>
            </section>

            {/* Limitations of Liability */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Limitations of Liability</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>109Cops and its operators:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Are not responsible for the actions or inactions of law enforcement agencies</li>
                  <li>Do not guarantee specific outcomes for reported incidents</li>
                  <li>Reserve the right to modify or discontinue services without notice</li>
                  <li>Are not liable for any indirect, incidental, or consequential damages</li>
                </ul>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-pink-600 to-red-600 p-3 rounded-lg">
                  <HelpCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Dispute Resolution</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>Any disputes arising from the use of 109Cops will be resolved through:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Initial informal negotiation</li>
                  <li>Mediation by a mutually agreed-upon mediator</li>
                  <li>Binding arbitration if mediation fails</li>
                  <li>Jurisdiction of courts in India</li>
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

export default TermsOfService;