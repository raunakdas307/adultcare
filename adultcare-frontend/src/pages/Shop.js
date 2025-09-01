import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Accessibility,
  Stethoscope,
  Droplet,
  UtensilsCrossed,
  Hand,
  Activity,
  BedDouble,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

import AdultDiaperImg from '../assets/images/Adult Diaper2.jpg';
import antirashImg from '../assets/images/antirash2.jpg';
import backsupportImg from '../assets/images/backsupport2.jpg';
import bedpadsImg from '../assets/images/bed pads2.jpg';
import bpmonitorImg from '../assets/images/bp monitor2.jpg';
import compressionstockingsImg from '../assets/images/compression stockings2.jpg';
import disposableImg from '../assets/images/disposable2.jpg';
import electricblanketImg from '../assets/images/electric blanket2.jpg';
import glucosemeterImg from '../assets/images/glucose meter2.jpg';
import heatingpadsImg from '../assets/images/heatingpads2.jpg';
import kneebracesImg from '../assets/images/knee braces2.jpg';
import massagerImg from '../assets/images/masager2.jpg';
import multivitaminImg from '../assets/images/multivitamin2.jpg';
import orthopedicImg from '../assets/images/orthopedic2.jpg';
import overnightpadsImg from '../assets/images/overnightpads2.jpg';
import oximeterImg from '../assets/images/oximeter2.jpg';
import porridgeImg from '../assets/images/porridge2.jpg';
import proteinsupplementImg from '../assets/images/protein supplement2.jpg';
import socksImg from '../assets/images/socks2.jpg';
import stickImg from '../assets/images/stick2.jpg';
import stretchersImg from '../assets/images/stretchers2.jpg';
import thermometerImg from '../assets/images/thermometer2.jpg';
import vaporizerImg from '../assets/images/vaporizer2.jpg';
import walkersImg from '../assets/images/walkers2.jpg';
import wetwipesImg from '../assets/images/wet wipes2.jpg';
import wheelchairImg from '../assets/images/whellchair2.jpg';

// ✅ Removed useEffect (not needed)

const categories = [
  {
    title: "Adult Diapers",
    description: "Disposable diapers, pant-style, overnight pads",
    icon: <ShoppingBag className="text-purple-600 w-8 h-8 mb-3" />,
  },
  {
    title: "Mobility Aids",
    description: "Walkers, walking sticks, wheelchairs",
    icon: <Accessibility className="text-purple-600 w-8 h-8 mb-3" />,
  },
  {
    title: "Medical Equipment",
    description: "BP monitors, glucose meters, oximeters, thermometers",
    icon: <Stethoscope className="text-purple-600 w-8 h-8 mb-3" />,
  },
  {
    title: "Hygiene Products",
    description: "Wet wipes, bed pads, anti-rash creams",
    icon: <Droplet className="text-purple-600 w-8 h-8 mb-3" />,
  },
  {
    title: "Nutritional Supplements",
    description: "Protein powders, multivitamins, liquid food aids",
    icon: <UtensilsCrossed className="text-purple-600 w-8 h-8 mb-3" />,
  },
  {
    title: "Daily Use Items",
    description: "Heating Pads, incontinence products, non-slip socks",
    icon: <Hand className="text-purple-600 w-8 h-8 mb-3" />,
  },
  {
    title: "Rehabilitation Aids",
    description: "Knee braces, back supports, compression stockings",
    icon: <Activity className="text-purple-600 w-8 h-8 mb-3" />,
  },
  {
    title: "Comfort Accessories",
    description: "Orthopedic pillows, massagers, electric blankets",
    icon: <BedDouble className="text-purple-600 w-8 h-8 mb-3" />,
  },
];

const allProducts = [
  { id: 1, name: 'Adult Diapers (Pant Style)', category: 'Adult Diapers', price: 499, image: AdultDiaperImg },
  { id: 2, name: 'Disposable Adult Diapers', category: 'Adult Diapers', price: 399, image: disposableImg },
  { id: 3, name: 'Overnight Long Lasting Pads', category: 'Adult Diapers', price: 349, image: overnightpadsImg },
  { id: 4, name: 'Wheelchair (Foldable)', category: 'Mobility Aids', price: 7999, image: wheelchairImg },
  { id: 5, name: 'Walkers', category: 'Mobility Aids', price: 5999, image: walkersImg },
  { id: 6, name: 'Walking Stick', category: 'Mobility Aids', price: 999, image: stickImg },
  { id: 7, name: 'Stretchers', category: 'Mobility Aids', price: 2999, image: stretchersImg },
  { id: 8, name: 'Glucose Meter', category: 'Medical Equipment', price: 1299, image: glucosemeterImg },
  { id: 9, name: 'BP Monitor', category: 'Medical Equipment', price: 1899, image: bpmonitorImg },
  { id: 10, name: 'Oximeter', category: 'Medical Equipment', price: 899, image: oximeterImg },
  { id: 11, name: 'Thermometer', category: 'Medical Equipment', price: 999, image: thermometerImg },
  { id: 12, name: 'Orthopedic Pillow', category: 'Comfort Accessories', price: 599, image: orthopedicImg },
  { id: 13, name: 'Massager', category: 'Comfort Accessories', price: 1899, image: massagerImg },
  { id: 14, name: 'Electric Blanket', category: 'Comfort Accessories', price: 3899, image: electricblanketImg },
  { id: 15, name: 'Wet Wipes (Pack of 100)', category: 'Hygiene Products', price: 299, image: wetwipesImg },
  { id: 16, name: 'Bed Pads', category: 'Hygiene Products', price: 399, image: bedpadsImg },
  { id: 17, name: 'Anti Rash Cream', category: 'Hygiene Products', price: 149, image: antirashImg },
  { id: 18, name: 'Protein Supplement (Vanilla)', category: 'Nutritional Supplements', price: 799, image: proteinsupplementImg },
  { id: 19, name: 'Oats Porridge', category: 'Nutritional Supplements', price: 249, image: porridgeImg },
  { id: 20, name: 'Multivitamin Tablets (30 days)', category: 'Nutritional Supplements', price: 449, image: multivitaminImg },
  { id: 21, name: 'Back Support Belt', category: 'Rehabilitation Aids', price: 999, image: backsupportImg },
  { id: 22, name: 'Knee Braces', category: 'Rehabilitation Aids', price: 449, image: kneebracesImg },
  { id: 23, name: 'Compression Stockings', category: 'Rehabilitation Aids', price: 399, image: compressionstockingsImg },
  { id: 24, name: 'Non Slip Socks', category: 'Daily Use Items', price: 199, image: socksImg },
  { id: 25, name: 'Heating Pads', category: 'Daily Use Items', price: 249, image: heatingpadsImg },
  { id: 26, name: 'Vaporizer', category: 'Daily Use Items', price: 899, image: vaporizerImg },
];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const productSectionRef = useRef(null);

  const filteredProducts = selectedCategory
    ? allProducts.filter((p) => p.category === selectedCategory)
    : [];

  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setTimeout(() => {
      productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-white pt-32 pb-20 px-6 md:px-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-purple-700 dark:text-purple-400 mb-4">
          🛒 Shop Adult Care Essentials
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-12">
          Curated products for comfort, health, and daily support.
        </p>
      </motion.div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categories.map((item, index) => (
          <motion.div
            key={index}
            onClick={() => handleCategoryClick(item.title)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer bg-purple-50 dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center text-center"
          >
            {item.icon}
            <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Product Display */}
      <div ref={productSectionRef} className="mt-16">
        {filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-bold text-purple-700 mb-2">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">₹{product.price}</p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Shop;
