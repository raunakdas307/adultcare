import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import API from "../api"; // ✅ axios instance with JWT refresh

export default function MyBookings() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("all"); // all | upcoming | past | cancelled
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("new"); // new | old
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toCancel, setToCancel] = useState(null);

  const container =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
  const card = theme === "dark" ? "bg-gray-800" : "bg-white";
  const inputBase =
    "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600";

  const badgeBase = "px-2 py-0.5 rounded text-xs font-semibold inline-block";
  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed")
      return `${badgeBase} bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300`;
    if (s === "cancelled")
      return `${badgeBase} bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`;
    return `${badgeBase} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300`;
  };

  const caregiversById = useMemo(() => {
    const map = new Map();
    for (const c of caregivers) {
      const id = c.id ?? c.pk;
      if (id != null) map.set(id, c);
    }
    return map;
  }, [caregivers]);

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login", { state: { redirectTo: "/my-bookings" } });
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // both bookings + caregivers
        const [bookingsRes, caregiversRes] = await Promise.all([
          API.get("/api/caregivers/bookings/"),
          API.get("/api/caregivers/profiles/"),
        ]);

        const bookingsData = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : bookingsRes.data.results || [];

        const caregiversData = Array.isArray(caregiversRes.data)
          ? caregiversRes.data
          : caregiversRes.data.results || [];

        if (!cancelled) {
          setBookings(bookingsData);
          setCaregivers(caregiversData);
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login", { state: { redirectTo: "/my-bookings" } });
          return;
        }
        console.error("Failed to load bookings:", err?.response?.data || err.message);
        if (!cancelled)
          setError("Failed to load your bookings. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Helpers
  const todayStr = new Date().toISOString().slice(0, 10);
  
  // Filter, search, sort
  const filtered = useMemo(() => {
  const isPast = (dateStr) => dateStr < todayStr;
  const isUpcoming = (dateStr) => dateStr >= todayStr;
    let list = bookings.slice();

    // Tabs
    if (activeTab === "upcoming") {
      list = list.filter(
        (b) => (b.status || "").toLowerCase() !== "cancelled" && isUpcoming(b.date)
      );
    } else if (activeTab === "past") {
      list = list.filter(
        (b) => (b.status || "").toLowerCase() !== "cancelled" && isPast(b.date)
      );
    } else if (activeTab === "cancelled") {
      list = list.filter((b) => (b.status || "").toLowerCase() === "cancelled");
    }

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((b) => {
        const cg = caregiversById.get(b.caregiver);
        const name = (cg?.name || "").toLowerCase();
        return name.includes(q);
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "old")
        return a.date.localeCompare(b.date) || a.id - b.id;
      return b.date.localeCompare(a.date) || b.id - a.id;
    });

    return list;
  }, [bookings, activeTab, search, sortBy, caregiversById, todayStr]);

  const openCancel = (id) => {
    setToCancel(id);
    setConfirmOpen(true);
  };
  const closeCancel = () => {
    if (!cancellingId) {
      setConfirmOpen(false);
      setToCancel(null);
    }
  };

  const cancelBooking = async () => {
    const id = toCancel;
    if (!id) return;

    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login", { state: { redirectTo: "/my-bookings" } });
      return;
    }

    try {
      setCancellingId(id);
      await API.patch(`/api/caregivers/bookings/${id}/`, { status: "cancelled" });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
      setConfirmOpen(false);
      setToCancel(null);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login", { state: { redirectTo: "/my-bookings" } });
        return;
      }
      console.error("Cancel failed:", err?.response?.data || err.message);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div
      className={`min-h-screen pt-24 px-4 transition-colors duration-300 ${container}`}
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">My Bookings</h1>

        {/* Controls */}
        <div className={`rounded-2xl shadow p-4 mb-6 ${card}`}>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
              { key: "cancelled", label: "Cancelled" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  activeTab === t.key
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:opacity-90"
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="flex-1" />

            {/* Search */}
            <div className="w-full sm:w-64">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search caregiver"
                className={inputBase}
              />
            </div>

            {/* Sort */}
            <div className="w-full sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={inputBase}
                title="Sort by date"
              >
                <option value="new">Newest first</option>
                <option value="old">Oldest first</option>
              </select>
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className={`${card} rounded-2xl p-6 shadow`}>
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className={`${card} rounded-2xl p-6 shadow text-center`}>
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className={`${card} rounded-2xl p-8 shadow text-center`}>
            <p className="opacity-80">No bookings to show here.</p>
            <Link
              to="/caregivers"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              Browse Caregivers
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-5">
            {filtered.map((b) => {
              const cg = caregiversById.get(b.caregiver);
              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-4 p-5 rounded-2xl shadow ${card}`}
                >
                  <img
                    src={cg?.avatar || "https://via.placeholder.com/90"}
                    alt={cg?.name || `Caregiver #${b.caregiver}`}
                    className="w-16 h-16 rounded-full object-cover border"
                  />

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {cg?.name || `Caregiver #${b.caregiver}`}
                      </h2>
                      <span className={statusBadge(b.status)}>{b.status}</span>
                    </div>

                    <div className="mt-1 text-sm opacity-80">
                      {cg?.specialization && <span>{cg.specialization}</span>}
                      {cg?.qualification && (
                        <span className="ml-2">• {cg.qualification}</span>
                      )}
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="opacity-70">Date:</span>{" "}
                      <span className="font-medium">{b.date}</span>
                      <span className="mx-2">•</span>
                      <span className="opacity-70">Slot:</span>{" "}
                      <span className="font-medium">{b.time_slot}</span>
                      {typeof cg?.fees !== "undefined" && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="opacity-70">Fee:</span>{" "}
                          <span className="font-medium">₹ {cg.fees}</span>
                        </>
                      )}
                    </div>

                    {b.notes ? (
                      <div className="mt-2 text-sm opacity-80">
                        <span className="opacity-70">Notes:</span> {b.notes}
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/booking/${b.id}`}
                        state={{ booking: b, caregiver: cg }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        View Details
                      </Link>

                      <button
                        className={`px-3 py-1.5 rounded-lg transition ${
                          (b.status || "").toLowerCase() === "cancelled"
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                        onClick={() => openCancel(b.id)}
                        disabled={
                          (b.status || "").toLowerCase() === "cancelled" ||
                          cancellingId === b.id
                        }
                      >
                        {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && (
          <div className="flex justify-center gap-3 mt-8">
            <Link
              to="/caregivers"
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
            >
              Browse Caregivers
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              Home
            </Link>
          </div>
        )}
      </div>

      {/* Cancel Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeCancel} />
          <div
            className={`relative w-full max-w-md mx-4 rounded-2xl shadow-lg p-6 ${card}`}
          >
            <h3 className="text-lg font-semibold">Cancel this booking?</h3>
            <p className="text-sm opacity-80 mt-2">
              This marks your booking as{" "}
              <span className="font-semibold">cancelled</span>. You can book
              another slot anytime.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeCancel}
                disabled={!!cancellingId}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
              >
                Close
              </button>
              <button
                onClick={cancelBooking}
                disabled={!!cancellingId}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  cancellingId
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {cancellingId ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
            <button
              onClick={closeCancel}
              disabled={!!cancellingId}
              className="absolute top-3 right-3 text-sm opacity-70 hover:opacity-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
