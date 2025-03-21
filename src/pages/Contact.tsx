import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Footer from '../components/Footer';
import Header from '../components/Header';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="h-8 w-8 text-white" />,
      title: "Email",
      description: "support@109cops.com\ninfo@109cops.com",
      color: "from-blue-600 to-indigo-600"
    },
    {
      icon: <Phone className="h-8 w-8 text-white" />,
      title: "Phone",
      description: "+91 109 COPS (2677)\nToll-free: 1800-109-COPS",
      color: "from-indigo-600 to-purple-600"
    },
    {
      icon: <MapPin className="h-8 w-8 text-white" />,
      title: "Address",
      description: "109Cops Headquarters\nPolice Technology Park\nCyber City, Gurugram\nHaryana - 122002",
      color: "from-purple-600 to-pink-600"
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
            src="https://images.pexels.com/photos/4267530/pexels-photo-4267530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Contact Us"
            className="w-full h-full object-cover transform-gpu scale-125 contrast-125 brightness-75"
          />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-300 font-medium tracking-wide leading-relaxed"
          >
            We're here to help and answer any questions you might have
          </motion.p>
        </div>
      </div>

      {/* Contact Information and Form */}
      <div ref={ref} className="max-w-7xl mx-auto px-4 py-20 bg-gray-900">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="group relative bg-white dark:bg-gray-700 rounded-xl p-8 
                          border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500
                          transform-gpu hover:-translate-y-2 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${info.color} flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110`}>
                  {info.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{info.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-gray-700 rounded-xl p-8 h-fit
                      border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500
                      transform-gpu hover:-translate-y-2 shadow-lg hover:shadow-xl transition-all"
          >
            <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6 text-gray-950 dark:text-gray-200">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2.5 bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Send Message</span>
                <Send className="h-5 w-5" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;