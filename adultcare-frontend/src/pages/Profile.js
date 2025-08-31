import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  Activity,
  Pill,
  ClipboardList,
  Apple,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API from "../api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        // ✅ Fixed Djoser endpoint
        const res = await API.get("/api/auth/users/me/");
        if (!cancelled) setUser(res.data);
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login", { state: { redirectTo: "/profile" } });
          return;
        }
        console.error(err?.response?.data || err.message);
        navigate("/login", { state: { redirectTo: "/profile" } });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  // Sample health data
  const healthData = [
    { month: "Jan", bmi: 23, weight: 92 },
    { month: "Feb", bmi: 22.7, weight: 91 },
    { month: "Mar", bmi: 22.5, weight: 90 },
    { month: "Apr", bmi: 22.4, weight: 92 },
  ];
  const bpData = [
    { month: "Jan", systolic: 120, diastolic: 78 },
    { month: "Feb", systolic: 122, diastolic: 79 },
    { month: "Mar", systolic: 124, diastolic: 80 },
    { month: "Apr", systolic: 126, diastolic: 82 },
  ];
  const metrics = [
    { label: "BMI", value: "22.4", trend: "↓" },
    { label: "Weight", value: "92 kg", trend: "↑" },
    { label: "Height", value: "175 cm", trend: "" },
    { label: "Blood Pressure", value: "124/80", trend: "↑" },
  ];
  const timeline = [
    "Dec 2022 - Pre-diabetic",
    "Jan 2022 - Type 2",
    "Jul 2021 - Thyroid Disorder",
  ];
  const history = [
    "Chronic thyroid disorder, IHD",
    "Diabetes Emergencies: Ketoacidosis",
    "Family disease: Obesity",
  ];
  const medications = ["ACTRAPID HM1", "Panadol 1000mg", "Amaryl 1mg"];
  const diet = ["8 cups water / day", "Intermittent fasting", "Lactose, Beans to avoid"];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between">
        <div>
          <div className="p-6 text-2xl font-bold text-purple-600 dark:text-purple-400">
            ACare
          </div>
          <nav className="mt-6 flex flex-col space-y-2">
            <button className="flex items-center gap-3 px-6 py-3 hover:bg-purple-100 dark:hover:bg-purple-700 transition">
              <User className="w-5 h-5" />
              <span className="hidden md:block">Patients</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 hover:bg-purple-100 dark:hover:bg-purple-700 transition">
              <Activity className="w-5 h-5" />
              <span className="hidden md:block">Overview</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 hover:bg-purple-100 dark:hover:bg-purple-700 transition">
              <Pill className="w-5 h-5" />
              <span className="hidden md:block">Medications</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 hover:bg-purple-100 dark:hover:bg-purple-700 transition">
              <ClipboardList className="w-5 h-5" />
              <span className="hidden md:block">Lab Results</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 hover:bg-purple-100 dark:hover:bg-purple-700 transition">
              <Apple className="w-5 h-5" />
              <span className="hidden md:block">Diet</span>
            </button>
          </nav>
        </div>
        <div className="p-6">
          <button
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              navigate("/login");
            }}
            className="flex items-center gap-3 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Patient Profile</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition">
            <Settings className="w-5 h-5" />
            Edit
          </button>
        </div>

        {/* Patient Overview */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || "/avatar.png"}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-purple-400"
              onError={(e) => {
                e.currentTarget.src = "/avatar.png";
              }}
            />
            <div>
              <h2 className="text-2xl font-semibold">{user.username}</h2>
              <p className="text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span>📍 {user.location || "Unknown"}</span>
                <span>📧 {user.email}</span>
                <span>📞 {user.phone || "Not provided"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Health Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow p-4"
            >
              <h3 className="text-lg font-semibold">{metric.label}</h3>
              <p className="text-2xl font-bold mt-2">{metric.value}</p>
              {metric.trend && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Trend: {metric.trend}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">BMI & Weight Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bmi" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="weight" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Blood Pressure Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="diastolic" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Timeline & History */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Timeline</h3>
            <ul className="space-y-3">
              {timeline.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span>{item}</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Medical History</h3>
            <ul className="space-y-2">
              {history.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Medications & Diet */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Medications</h3>
            <ul className="space-y-2">
              {medications.map((med, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{med}</span>
                  <span className="text-green-500">Adherent</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Diet / Lifestyle</h3>
            <ul className="space-y-2">
              {diet.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
