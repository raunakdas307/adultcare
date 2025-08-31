import React, { useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (acc, item) =>
          acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  const goToCheckout = () => {
    const access = localStorage.getItem("access");
    const payload = { items: cart, total: totalPrice };

    if (!access) {
      // Not logged in → redirect to login, preserve cart payload
      navigate("/login", { state: { redirectTo: "/checkout", cartPayload: payload } });
      return;
    }

    // Logged in → go to checkout with payload
    navigate("/checkout", { state: payload });
  };

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
      Number(n) || 0
    );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 md:px-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
      <h1 className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-400 mb-10 text-center">
        🛍️ Your Cart
      </h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          Your cart is empty.
        </p>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className="flex flex-col md:flex-row gap-4 items-center bg-purple-50 dark:bg-neutral-900 p-4 rounded-xl shadow"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/96";
                }}
              />
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  {item.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  ₹{formatINR(item.price)}
                </p>
              </div>

              {/* Quantity Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))
                  }
                  disabled={(item.quantity || 1) === 1}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-60"
                >
                  -
                </button>
                <span className="font-semibold">{item.quantity || 1}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.id, (item.quantity || 1) + 1)
                  }
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  +
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-0 md:ml-4 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </motion.div>
          ))}

          {/* Total */}
          <div className="text-right mt-8">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              Total: ₹{formatINR(totalPrice)}
            </h2>
            <div className="flex justify-end mt-4 gap-4">
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-400"
              >
                Continue Shopping
              </button>
              <button
                onClick={goToCheckout}
                disabled={totalPrice <= 0}
                className={`px-6 py-3 text-white font-semibold rounded-full transition ${
                  totalPrice <= 0
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
