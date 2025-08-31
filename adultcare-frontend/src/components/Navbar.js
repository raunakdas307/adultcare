import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { animateScroll as scroll } from 'react-scroll';
import { Menu, X, Sun, Moon, ShoppingCart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      scroll.scrollToTop({ duration: 500 });
    } else {
      navigate('/');
    }
  };

  // Smooth-scroll to section with offset for fixed navbar (~80px)
  const smoothScrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // Click handler for About/Services/Contact
  const handleSectionClick = (section) => {
    if (location.pathname === '/') {
      smoothScrollTo(section);
    } else {
      navigate('/', { state: { scrollTo: section } });
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // When we land on / with a target section in location.state, scroll to it
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      // slight delay to ensure sections are rendered
      setTimeout(() => smoothScrollTo(location.state.scrollTo), 50);
    }
  }, [location.pathname, location.state]);

  const navItems = ['home', 'about', 'services', 'shop', 'caregivers', 'contact'];
  const isHomePage = location.pathname === '/';

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isHomePage
          ? scrolled
            ? 'bg-white dark:bg-gray-900 shadow-md'
            : 'bg-transparent backdrop-blur-sm'
          : 'bg-white dark:bg-gray-900 shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex justify-between items-center">
        {/* Logo */}
        <span
          onClick={handleLogoClick}
          className={`text-2xl font-bold cursor-pointer transition-colors duration-500 ${
            isHomePage && !scrolled ? 'text-white' : 'text-purple-700'
          }`}
        >
          AdultCare
        </span>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <div
            className={`flex gap-6 text-lg font-bold transition-colors duration-500 ${
              isHomePage && !scrolled
                ? 'text-white'
                : 'text-purple-700 dark:text-gray-200'
            }`}
          >
            {navItems.map((item) => {
              if (item === 'shop') {
                return (
                  <Link
                    key={item}
                    to="/shop"
                    className="cursor-pointer hover:text-purple-900 transition"
                  >
                    Shop
                  </Link>
                );
              }
              if (item === 'caregivers') {
                return (
                  <Link
                    key={item}
                    to="/caregivers"
                    className="cursor-pointer hover:text-purple-900 transition"
                  >
                    Caregivers
                  </Link>
                );
              }
              if (item === 'home') {
                return (
                  <Link
                    key={item}
                    to="/"
                    className="cursor-pointer hover:text-purple-900 transition"
                  >
                    Home
                  </Link>
                );
              }
              // about / services / contact → scroll-aware handler
              return (
                <span
                  key={item}
                  onClick={() => handleSectionClick(item)}
                  className="cursor-pointer hover:text-purple-900 transition"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              );
            })}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`ml-6 transition-colors duration-500 ${
              isHomePage && !scrolled
                ? 'text-white hover:text-gray-200'
                : 'text-purple-700 hover:text-purple-900'
            }`}
          >
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          {/* Cart */}
          <div
            className="relative cursor-pointer"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart
              className={`transition-colors duration-500 ${
                isHomePage && !scrolled
                  ? 'text-white hover:text-gray-200'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </div>

          {/* Login */}
          <Link
            to="/login"
            className="ml-4 px-4 py-2 rounded-lg transition duration-300 bg-purple-600 text-white hover:bg-purple-700"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`transition-colors duration-500 ${
              isHomePage && !scrolled ? 'text-white' : 'text-purple-700'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pt-4 pb-6 bg-white dark:bg-gray-900 transition">
          <div className="flex flex-col gap-4 text-purple-700 font-semibold">
            {navItems.map((item) => {
              if (item === 'shop') {
                return (
                  <Link
                    key={item}
                    to="/shop"
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer hover:text-purple-900 transition"
                  >
                    Shop
                  </Link>
                );
              }
              if (item === 'caregivers') {
                return (
                  <Link
                    key={item}
                    to="/caregivers"
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer hover:text-purple-900 transition"
                  >
                    Caregivers
                  </Link>
                );
              }
              if (item === 'home') {
                return (
                  <Link
                    key={item}
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer hover:text-purple-900 transition"
                  >
                    Home
                  </Link>
                );
              }
              // about / services / contact
              return (
                <span
                  key={item}
                  onClick={() => handleSectionClick(item)}
                  className="cursor-pointer hover:text-purple-900 transition"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              );
            })}

            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="mt-2 text-purple-700 hover:text-purple-900 flex items-center gap-2"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />} Theme
            </button>

            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer hover:text-purple-900 transition"
            >
              Cart ({cart.length})
            </Link>

            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
