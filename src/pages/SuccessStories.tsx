import { motion } from 'framer-motion';
import { Star, ThumbsUp, Clock, Shield } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

const SuccessStories = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const stories = [
    {
      title: "Stolen Vehicle Recovery",
      description: "A citizen reported their stolen car through 109Cops. Within 18 hours, local police tracked and recovered the vehicle, leading to the arrest of the perpetrators.",
      location: "Mumbai, Maharashtra",
      timeToResolve: "18 hours",
      image: "https://images.pexels.com/photos/30223365/pexels-photo-30223365/free-photo-of-policeman-on-rural-road-in-india.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Cybercrime Prevention",
      description: "An elderly citizen reported a potential online banking fraud. Quick police intervention prevented a significant financial loss and led to the identification of a cybercrime ring.",
      location: "Bangalore, Karnataka",
      timeToResolve: "12 hours",
      image: "https://images.pexels.com/photos/4267531/pexels-photo-4267531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Missing Person Found",
      description: "A missing teenager was located within 24 hours of the report being filed through 109Cops, thanks to swift police action and community cooperation.",
      location: "Delhi, NCR",
      timeToResolve: "24 hours",
      image: "https://images.pexels.com/photos/14260022/pexels-photo-14260022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  const stats = [
    { icon: <Clock className="h-6 w-6 text-white" />, value: "24hr", label: "Average Response Time" },
    { icon: <Shield className="h-6 w-6 text-white" />, value: "1000+", label: "Cases Resolved" },
    { icon: <ThumbsUp className="h-6 w-6 text-white" />, value: "98%", label: "Satisfaction Rate" },
    { icon: <Star className="h-6 w-6 text-white" />, value: "4.8/5", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen  bg-gray-900 text-gray-300">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 backdrop-blur-sm" />
          <img
            src="https://images.pexels.com/photos/26971843/pexels-photo-26971843/free-photo-of-smiling-men-standing-in-uniforms.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Success Stories"
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
            Success Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-300 font-medium tracking-wide leading-relaxed"
          >
            Real cases where 109Cops made a difference in people's lives
          </motion.p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-6 text-center 
                          border border-gray-200 dark:border-gray-600
                          transform-gpu hover:-translate-y-2 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories Grid */}
      <div ref={ref} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden 
                          border border-gray-200 dark:border-gray-600
                          transform-gpu hover:-translate-y-2 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">{story.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{story.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{story.location}</span>
                    <span>Resolved in: {story.timeToResolve}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Have an Incident to Report?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of citizens who have successfully used 109Cops to report and resolve incidents.
            </p>
            <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300">
              Report an Incident
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SuccessStories;