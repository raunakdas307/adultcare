import React from "react";
import { useCart } from "../contexts/CartContext";
import { Cashfree } from "cashfree-pg-sdk-javascript";
import { useNavigate } from "react-router-dom";
import API from "../api"; // use our Axios instance

const Checkout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePayment = async () => {
    try {
      // Call Django backend to create Cashfree order
      const { data } = await API.get("/api/create-cashfree-order/");

      if (data.payment_session_id) {
        const cashfree = new Cashfree({ mode: "sandbox" }); // use "production" in live mode

        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self", // "_blank" for new tab
        });
      } else {
        alert("Payment session not received. Please try again.");
        console.error("Backend error:", data);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Payment failed to start.");
    }
  };

  return (
    <div className="min-h-screen pt-32 px-6 md:px-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-400 mb-10">
        🧾 Checkout
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Shipping Form */}
        <div className="bg-purple-50 dark:bg-neutral-900 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full p-2 rounded border dark:bg-gray-800" />
            <input type="text" placeholder="Address" className="w-full p-2 rounded border dark:bg-gray-800" />
            <input type="text" placeholder="City" className="w-full p-2 rounded border dark:bg-gray-800" />
            <input type="text" placeholder="Postal Code" className="w-full p-2 rounded border dark:bg-gray-800" />
            <input type="text" placeholder="Phone Number" className="w-full p-2 rounded border dark:bg-gray-800" />
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-purple-50 dark:bg-neutral-900 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <ul className="space-y-2">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>₹{totalPrice}</span>
          </div>
          <button
            onClick={handlePayment}
            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
