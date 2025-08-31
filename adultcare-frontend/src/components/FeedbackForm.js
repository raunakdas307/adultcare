import React, { useState } from "react";

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/users/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If user is logged in, pass token
          Authorization: localStorage.getItem("token")
            ? `Token ${localStorage.getItem("token")}`
            : "",
        },
        body: JSON.stringify({
          rating,
          comment: feedback,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Thank you for your feedback!");
        setRating(0);
        setFeedback("");
      } else {
        alert(data.message || "Error submitting feedback");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md max-w-lg mx-auto mt-10">
      <h3 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-400">
        Leave Your Feedback
      </h3>

      {/* Star Rating */}
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              type="button"
              key={index}
              className={`text-3xl ${starValue <= (hover || rating) ? "text-yellow-400" : "text-gray-400"}`}
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(null)}
            >
              ★
            </button>
          );
        })}
      </div>

      {/* Feedback Text */}
      <textarea
        className="w-full p-3 rounded border dark:bg-gray-800 dark:border-gray-700 mb-4"
        rows="4"
        placeholder="Write your feedback..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded shadow-lg transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
};

export default FeedbackForm;
