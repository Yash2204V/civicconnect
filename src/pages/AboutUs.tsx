import { motion } from 'framer-motion';
import { Shield, Users, Target, Award } from 'lucide-react';
import { useParallax } from 'react-scroll-parallax';
import { useInView } from 'react-intersection-observer';
import Footer from '../components/Footer';
import Header from '../components/Header';

const AboutUs = () => {

  const { ref: missionRef, inView: missionInView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const { ref: visionRef, inView: visionInView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const parallax = useParallax<HTMLDivElement>({
    speed: -10
  });




  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 text-white">
      {/* Hero Section */}

      <Header />

      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          ref={parallax.ref}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <img
            src="https://images.pexels.com/photos/13062468/pexels-photo-13062468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Police Background"
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
            About 109Cops
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto text-gray-300"
          >
            Bridging the gap between citizens and law enforcement through innovative technology and trusted partnerships.
          </motion.p>
        </div>
      </div>

      {/* Mission Section */}
      <div ref={missionRef} className="py-20 px-4 relative bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative z-10 space-y-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 dark:text-gray-100">
              Our Commitment
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {[
              { icon: Shield, title: "Rapid Response", text: "24/7 emergency response with guaranteed police action within 60 minutes", color: "text-red-500" },
              { icon: Users, title: "Community Trust", text: "Transparent reporting system with real-time status updates for citizens", color: "text-blue-500" },
              { icon: Target, title: "Crime Prevention", text: "AI-powered analytics to predict and prevent criminal hotspots", color: "text-green-500" },
              { icon: Award, title: "Excellence", text: "ISO-certified response protocols and officer training programs", color: "text-yellow-500" }
              ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={missionInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="group relative bg-white dark:bg-gray-700 rounded-xl p-8 
                    border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500
                    transform-gpu hover:-translate-y-2 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start space-x-6">
                <div className={`bg-gray-50 dark:bg-gray-900 p-4 rounded-xl 
                        group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors ${item.color}`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.text}</p>
                </div>
                </div>
              </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vision Section */}
      <div ref={visionRef} className="py-20 px-4 relative bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={visionInView ? { opacity: 1 } : {}}
            className="space-y-20"
          >
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100">
                Building a Safer Tomorrow
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                We envision an India where safety is not a privilege but a fundamental right, powered by
                <span className="text-gray-800 dark:text-indigo-300"> community-driven technology</span> and{" "}
                <span className="text-gray-700 dark:text-blue-300"> police empowerment</span>.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { value: "24/7", label: "Emergency Response" },
                { value: "100%", label: "Case Tracking" },
                { value: "1M+", label: "Protected Citizens" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={visionInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center 
                            border border-gray-200 dark:border-gray-700
                            transform-gpu hover:-translate-y-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="text-5xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div >
  );
};

export default AboutUs;