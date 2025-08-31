import React, { useEffect } from "react";
import { motion } from 'framer-motion';
import FeedbackForm from "../components/FeedbackForm";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { containerClass } from '../utils/themeClasses';
import {
  Syringe,
  HelpingHand,
  Footprints,
  Activity,
  HeartPulse,
  Stethoscope,
  AlarmClock,
  Brain,
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const smoothScrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  useEffect(() => {
    if (location.state?.scrollTo) {
      const t = setTimeout(() => smoothScrollTo(location.state.scrollTo), 50);
      return () => clearTimeout(t);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.state]);

  const services = [
    { title: 'Nursing Services', description: 'Post-hospitalization care, injection support, wound care', icon: <Syringe className="text-purple-600 w-8 h-8 mb-3" /> },
    { title: 'Home Caregiver', description: 'Daily assistance (bathing, feeding, medication reminders)', icon: <HelpingHand className="text-purple-600 w-8 h-8 mb-3" /> },
    { title: 'Assisted Walks', description: 'Companion for daily walks, exercises', icon: <Footprints className="text-purple-600 w-8 h-8 mb-3" /> },
    { title: 'Physiotherapy', description: 'At-home physio sessions (post-surgery, elderly stiffness)', icon: <Activity className="text-purple-600 w-8 h-8 mb-3" /> },
    { title: 'Doctor Consultation', description: 'On-call doctors or teleconsultation services', icon: <Stethoscope className="text-purple-600 w-8 h-8 mb-3" /> },
    { title: 'Emergency Response', description: 'Panic button + trained nurse visit / ambulance dispatch', icon: <AlarmClock className="text-purple-600 w-8 h-8 mb-3" /> },
    { title: 'Dementia Care', description: 'Specially trained staff for Alzheimers and memory care', icon: <Brain className="text-purple-600 w-8 h-8 mb-3" /> },
    { title: 'Wellness Monitoring', description: 'Regular vitals check, diet planning, activity scheduling', icon: <Heart className="text-purple-600 w-8 h-8 mb-3" /> },
  ];

  return (
    <div className={`min-h-screen ${containerClass(theme)}`}>

      {/* HERO SECTION */}
      <motion.section
        id="hero"
        className="relative w-full min-h-screen flex items-center justify-center text-center bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/adultcare3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          imageRendering: "crisp-edges",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/10 dark:from-black/40 dark:to-black/60" />

        <motion.div
          className="relative z-10 px-4 max-w-3xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            Welcome to <span className="text-purple-400">AdultCare Services</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Compassionate care for elderly and special needs — trained caregivers, emergency support and trusted products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => smoothScrollTo('services')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-md transition transform hover:-translate-y-0.5"
            >
              Explore Services
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-white/90 hover:bg-white text-purple-700 font-semibold px-6 py-3 rounded-full shadow-md transition"
            >
              Get Started
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: -8, opacity: 0.9 }}
          animate={{ y: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="hidden md:block absolute right-10 top-28"
        >
          <div className="p-3 bg-white/20 backdrop-blur rounded-full shadow-lg">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      </motion.section>

      {/* ABOUT SECTION */}
      <motion.section
        id="about"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-20 w-full bg-white dark:bg-black text-center"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-600 mb-6">About AdultCare</h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            AdultCare is a platform dedicated to connecting families with trusted caregivers, nurses, and elder care products with the aim of ensuring their comfort and peace of mind.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Trusted Professionals', desc: 'We connect families with verified, trained, and compassionate caregivers who provide personalized support — from daily assistance and medical care to emergency response and companionship.' },
              { title: 'Our Mission', desc: 'Our mission is simple: to ensure that every senior can live with dignity, comfort, and independence, while giving families the peace of mind they deserve. ' },
              { title: 'Elder Care Products', desc: 'We combine human compassion with technology to deliver reliable care at your doorstep, along with access to essential elder care products through our integrated e-commerce store.' },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-purple-500 mb-2">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SERVICES SECTION */}
      <motion.section
        id="services"
        className="py-20 w-full bg-white dark:bg-black"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-700 mb-6">Our Services</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-12 text-lg">
            Tailored services designed for elderly care, safety, and wellness.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="bg-purple-50 dark:bg-neutral-900 p-6 rounded-xl shadow-md flex flex-col items-center text-center"
              >
                <div className="mb-3">{service.icon}</div>
                <h3 className="text-xl font-semibold text-purple-700 mb-2">{service.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* TESTIMONIALS */}
      <motion.div
        className="w-full  bg-white dark:bg-black py-28 px-4 shadow-inner"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
          ❤️ What Families Say About Us
        </h2>
        <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
          {[
            { name: 'Mrs. Sharma', text: 'AdultCare Services has been a blessing for our family.The team was always responsive, and we felt supported every step of the way. '},
            { name: 'Mr. Iyer', text: 'We were struggling to find trustworthy elder care until we discovered AdultCare Services. Their booking process was seamless, and within 24 hours we had a compassionate, professional nurse at my father-in-law’s home. It’s rare to find a service that combines professionalism with genuine care.' },
            { name: 'Dr. Roy', text: 'As a doctor working with elderly patients, I see firsthand how crucial quality home care is. AdultCare Services bridges the gap between hospital and home with trained caregivers who understand medical needs as well as emotional well-being.' }
          ].map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="bg-gray-100 dark:bg-neutral-900 p-6 rounded-lg w-80 shadow-md"
            >
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">“{t.text}”</p>
              <p className="text-purple-600 font-semibold">- {t.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CONTACT */}
      <motion.section
        id="contact"
        className="py-20 w-full bg-white dark:bg-black"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-700 mb-6">Contact Us</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            Have questions or need assistance? Reach out to us anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-purple-600 mb-2">Email</h3>
              <p className="text-gray-700 dark:text-gray-300">support@adultcareservices.com</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-purple-600 mb-2">Phone</h3>
              <p className="text-gray-700 dark:text-gray-300">+91 9876543210</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-purple-600 mb-2">Office</h3>
              <p className="text-gray-700 dark:text-gray-300">Koramangala, Bangalore, India</p>
            </motion.div>
          </div>
          <FeedbackForm />
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="w-full mt-16 py-6 bg-purple-700 text-white text-center">
        <div className="flex justify-center gap-6 mb-2">
          <a href="https://facebook.com"><Facebook className="w-5 h-5 hover:text-gray-200" /></a>
          <a href="https://twitter.com"><Twitter className="w-5 h-5 hover:text-gray-200" /></a>
          <a href="https://instagram.com"><Instagram className="w-5 h-5 hover:text-gray-200" /></a>
          <a href="https://linkedin.com"><Linkedin className="w-5 h-5 hover:text-gray-200" /></a>
        </div>
        <p className="text-sm font-light">© 2025 AdultCare Services. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
