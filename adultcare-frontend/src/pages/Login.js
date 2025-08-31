import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo ?? null;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Login with JWT via Djoser
      const res = await API.post('/api/auth/jwt/create/', {
        email: formData.email,
        password: formData.password,
      });

      const access = res.data?.access;
      const refresh = res.data?.refresh;

      if (!access || !refresh) throw new Error('No JWT tokens returned.');

      // Save tokens
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      // Step 2: Get user profile (fixed endpoint ✅)
      const meRes = await API.get('/api/auth/users/me/', {
        headers: { Authorization: `Bearer ${access}` },
      });

      const role = meRes.data?.role;

      // Step 3: Redirect based on role
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (role === 'caregiver') {
        navigate('/caregiver-registration', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      const errors = err?.response?.data;
      let message = '❌ Login failed.';
      if (errors) {
        if (errors.detail) {
          message = errors.detail;
        } else {
          try {
            message = Object.values(errors).flat().join(' ');
          } catch {
            message = typeof errors === 'string' ? errors : message;
          }
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-purple-50 dark:bg-gray-900 transition duration-300 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md transition"
      >
        <h2 className="text-2xl font-bold text-center text-purple-700 dark:text-purple-400 mb-6">
          Login to Your Account
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="username"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ${
            loading ? 'opacity-80 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>

        <div className="mt-4 text-center text-sm">
          <span className="opacity-70">No account?</span>{' '}
          <Link to="/register" className="text-purple-600 underline">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
