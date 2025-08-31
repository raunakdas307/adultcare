import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    re_password: "", // required by Djoser
    role: "family",
    phone: "",
    location: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Step 1: Register user via Djoser
      await API.post("/api/auth/users/", formData);

      // Step 2: Login immediately to get JWT tokens
      const loginRes = await API.post("/api/auth/jwt/create/", {
        email: formData.email,
        password: formData.password,
      });

      const access = loginRes.data?.access;
      const refresh = loginRes.data?.refresh;

      if (!access || !refresh) throw new Error("No JWT tokens returned after registration.");

      // Save tokens
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Step 3: Fetch the real user profile (to get saved role)
      const meRes = await API.get("/api/users/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const role = meRes.data?.role;
      setSuccess("✅ Registration successful!");

      // Step 4: Redirect based on real backend role
      setTimeout(() => {
        if (role === "caregiver") {
          navigate("/caregiver-registration");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/profile");
        }
      }, 800);
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      let message = "❌ Registration failed.";
      if (errors) {
        try {
          message = Object.values(errors).flat().join(" ");
        } catch {
          message = typeof errors === "string" ? errors : message;
        }
      }
      setError(message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-purple-50 dark:bg-gray-900 transition duration-300 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md transition"
      >
        <h2 className="text-2xl font-bold text-center text-purple-700 dark:text-purple-400 mb-6">
          Create Your Account
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        {/* Fields */}
        {["email", "username", "password", "re_password", "phone", "location"].map((field) => (
          <div key={field} className="mb-4">
            <input
              type={field.includes("password") ? "password" : "text"}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
              value={formData[field]}
              onChange={handleChange}
              required={["email", "username", "password", "re_password"].includes(field)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        ))}

        {/* Role Dropdown */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="family">Family</option>
          <option value="caregiver">Caregiver</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
