import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import API from "../api"; // ✅ JWT-ready axios instance

export default function BookingPage() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [caregiver, setCaregiver] = useState(location.state?.caregiver || null);

  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState("");
  const [copying, setCopying] = useState(false);

  // Cancel modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      if (booking || !bookingId) return;

      try {
        setLoading(true);
        setError("");
        const access = localStorage.getItem("access");
        if (!access) {
          navigate("/login", { state: { redirectTo: `/booking/${bookingId}` } });
          return;
        }

        // 1) Load booking
        const res = await API.get(`/api/caregivers/bookings/${bookingId}/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        const b = res.data;
        setBooking(b);

        // 2) Load caregiver (if not passed) using booking.caregiver id
        if (!caregiver && b?.caregiver) {
          try {
            const cgRes = await API.get(`/api/caregivers/profiles/${b.caregiver}/`);
            setCaregiver(cgRes.data);
          } catch (cgErr) {
            console.error("Failed to load caregiver:", cgErr?.response?.data || cgErr.message);
          }
        }
      } catch (e) {
        console.error("Failed to load booking:", e.response?.data || e.message);
        setError("Could not load this booking. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const container =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
  const card = theme === "dark" ? "bg-gray-800" : "bg-white";

  const statusBadge = useMemo(() => {
    const s = (booking?.status || "").toLowerCase();
    if (s === "confirmed")
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    if (s === "cancelled")
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  }, [booking]);

  const copyId = async () => {
    if (!booking?.id) return;
    try {
      await navigator.clipboard.writeText(String(booking.id));
      setCopying(true);
      setTimeout(() => setCopying(false), 900);
    } catch {
      // ignore
    }
  };

  const openCancel = () => setConfirmOpen(true);
  const closeCancel = () => {
    if (!cancelling) setConfirmOpen(false);
  };

  const cancelBooking = async () => {
    if (!booking?.id) return;
    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login", { state: { redirectTo: `/booking/${booking.id}` } });
      return;
    }
    try {
      setCancelling(true);
      await API.patch(
        `/api/caregivers/bookings/${booking.id}/`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setBooking((b) => (b ? { ...b, status: "cancelled" } : b));
      setConfirmOpen(false);
    } catch (err) {
      console.error("Cancel failed:", err?.response?.data || err.message);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 px-4 ${container}`}>
        <div className="max-w-2xl mx-auto">
          <div className={`${card} rounded-2xl p-6 shadow`}>
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={`min-h-screen pt-24 px-4 ${container}`}>
        <div className="max-w-2xl mx-auto">
          <div className={`${card} rounded-2xl p-6 shadow`}>
            <h1 className="text-2xl font-bold mb-2">Booking not found</h1>
            <p className="opacity-80 mb-4">
              {error || "We couldn’t find that booking. Please try again."}
            </p>
            <Link to="/caregivers" className="text-purple-600 underline">
              Back to Caregivers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 px-4 ${container}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header banner */}
        <div className="rounded-2xl overflow-hidden shadow mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Booking Details</h1>
                <p className="text-white/90 text-sm">
                  Review your caregiver booking below
                </p>
              </div>
              <div className={`px-2 py-1 rounded ${statusBadge} bg-white/20`}>
                <span className="capitalize font-semibold">{booking.status}</span>
              </div>
            </div>
          </div>

          {/* Content card */}
          <div className={`${card} p-6`}>
            {/* Booking meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm opacity-70">Booking ID</div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">#{booking.id}</div>
                  <button
                    onClick={copyId}
                    className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
                  >
                    {copying ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-sm opacity-70">Date</div>
                <div className="font-semibold">{booking.date}</div>
              </div>

              <div>
                <div className="text-sm opacity-70">Time Slot</div>
                <div className="font-semibold">{booking.time_slot}</div>
              </div>

              <div>
                <div className="text-sm opacity-70">Status</div>
                <div className="font-semibold capitalize">{booking.status}</div>
              </div>
            </div>

            {/* Caregiver card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 mb-6">
              <img
                src={caregiver?.avatar || "https://via.placeholder.com/90"}
                alt={caregiver?.name || `Caregiver #${booking.caregiver}`}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div className="flex-1">
                <div className="font-semibold text-lg">
                  {caregiver?.name || `Caregiver #${booking.caregiver}`}
                </div>
                <div className="text-sm opacity-80">
                  {caregiver?.specialization || "General Care"}
                </div>
                <div className="text-sm opacity-70">
                  {caregiver?.qualification || "—"}
                </div>
              </div>
              <div className="text-right">
                {typeof caregiver?.fees !== "undefined" && (
                  <div className="font-semibold text-purple-600 dark:text-purple-300">
                    ₹ {caregiver.fees}{" "}
                    <span className="text-xs opacity-70">/hr</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {booking.notes ? (
              <div className="mb-6">
                <div className="text-sm opacity-70 mb-1">Notes</div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  {booking.notes}
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/caregivers"
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
              >
                Browse Caregivers
              </Link>
              <Link
                to="/my-bookings"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                View My Bookings
              </Link>

              {/* Cancel button */}
              <button
                onClick={openCancel}
                disabled={(booking.status || "").toLowerCase() === "cancelled"}
                className={`px-4 py-2 rounded-lg transition text-white ${
                  (booking.status || "").toLowerCase() === "cancelled"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeCancel} />
          <div className={`relative w-full max-w-md mx-4 rounded-2xl shadow-lg p-6 ${card}`}>
            <h3 className="text-lg font-semibold">Cancel this booking?</h3>
            <p className="text-sm opacity-80 mt-2">
              This will mark your booking as{" "}
              <span className="font-semibold">cancelled</span>. You can book another
              slot anytime.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
              >
                Close
              </button>
              <button
                onClick={cancelBooking}
                disabled={cancelling}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  cancelling
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {cancelling ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
            <button
              onClick={closeCancel}
              disabled={cancelling}
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