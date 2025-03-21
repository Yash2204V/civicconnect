import { motion } from 'framer-motion';
import { FileText, Shield, Bell, CheckCircle } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Footer from '../components/Footer';
import Header from '../components/Header';

const HowItWorks = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const steps = [
    {
      icon: <FileText className="h-8 w-8 text-white" />,
      title: "Report an Incident",
      description: "Submit detailed information about the incident through our user-friendly platform. Include location, time, and any supporting evidence.",
      color: "from-blue-600 to-indigo-600"
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: "Police Verification",
      description: "Our verified police officers review the report and assess the situation within hours of submission.",
      color: "from-indigo-600 to-purple-600"
    },
    {
      icon: <Bell className="h-8 w-8 text-white" />,
      title: "Action Initiation",
      description: "Officers take immediate action within 24 hours. You'll receive real-time updates on the progress.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-white" />,
      title: "Case Resolution",
      description: "Follow the case progress through your dashboard until it reaches resolution. Provide additional information if needed.",
      color: "from-pink-600 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen  bg-gray-900 text-gray-300">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 backdrop-blur-sm" />
          <img
            src="https://images.pexels.com/photos/10239898/pexels-photo-10239898.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Police Operations"
            className="w-full h-full object-cover object-center transform-gpu scale-125 contrast-125 brightness-75"
          />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent"
          >
            How It Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto  :text-gray-300 font-medium tracking-wide leading-relaxed"
          >
            A simple, secure process to report incidents and get swift police action
          </motion.p>
        </div>
      </div>

      {/* Process Steps */}
      <div ref={ref} className="max-w-7xl mx-auto px-4 py-20  :bg-gray-800">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative bg-white dark:bg-gray-700 rounded-xl p-8 
                        border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500
                        transform-gpu hover:-translate-y-2 shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="py-20 px-4 bg-bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">Important Information</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">What You Need to Report</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  {[
                    "Incident details (what, when, where)",
                    "Your contact information",
                    "Any supporting evidence (photos, videos)",
                    "Witness information (if available)"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Our Commitment</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  {[
                    "24-hour response time",
                    "Complete confidentiality",
                    "Professional handling of cases",
                    "Regular status updates"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;