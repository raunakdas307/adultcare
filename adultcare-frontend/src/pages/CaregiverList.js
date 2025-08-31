import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api"; // ✅ JWT-ready Axios instance

function CaregiverList() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [caregivers, setCaregivers] = useState([]);

  // BOOKING MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time_slot: "09:00-10:00",
    notes: "",
  });
  const [modalError, setModalError] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // UI CONTROLS
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [sortKey, setSortKey] = useState("live-first");

  const timeSlots = [
    "07:00-08:00",
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
  ];

  // LOAD LIVE + MOCK
  useEffect(() => {
    const mockCaregivers = [
      { id: "m1", name: "Dr. Sarah Johnson", avatar: "https://randomuser.me/api/portraits/women/44.jpg", specialization: "Elderly Care", qualification: "PhD in Nursing", fees: "100", _live: false },
      { id: "m2", name: "Michael Smith", avatar: "https://randomuser.me/api/portraits/men/32.jpg", specialization: "Child Care", qualification: "Certified Caregiver", fees: "200", _live: false },
      { id: "m3", name: "Laura Davis", avatar: "https://randomuser.me/api/portraits/women/65.jpg", specialization: "Disability Support", qualification: "BSc in Physiotherapy", fees: "350", _live: false },
      { id: "m4", name: "James Anderson", avatar: "https://randomuser.me/api/portraits/men/68.jpg", specialization: "Post-Surgery Care", qualification: "RN, 8 years experience", fees: "500", _live: false },
      { id: "m5", name: "Sophia Brown", avatar: "https://randomuser.me/api/portraits/women/72.jpg", specialization: "Newborn Care", qualification: "Certified Nanny", fees: "250", _live: false },
      { id: "m6", name: "David Wilson", avatar: "https://randomuser.me/api/portraits/men/77.jpg", specialization: "Rehabilitation Support", qualification: "Physiotherapy Assistant", fees: "350", _live: false },
      { id: "m7", name: "Olivia Martinez", avatar: "https://randomuser.me/api/portraits/women/60.jpg", specialization: "Special Needs Care", qualification: "Diploma in Special Education", fees: "200", _live: false },
      { id: "m8", name: "Ethan Taylor", avatar: "https://randomuser.me/api/portraits/men/41.jpg", specialization: "Elderly Care", qualification: "Certified Geriatric Caregiver", fees: "200", _live: false },
      { id: "m9", name: "Ava Thompson", avatar: "https://randomuser.me/api/portraits/women/53.jpg", specialization: "Child Care", qualification: "Early Childhood Education Degree", fees: "100", _live: false },
      { id: "m10", name: "Daniel White", avatar: "https://randomuser.me/api/portraits/men/55.jpg", specialization: "Home Nursing", qualification: "Registered Nurse", fees: "400", _live: false },
    ];

    API.get("/api/caregivers/profiles/")
      .then((res) => {
        const api = Array.isArray(res.data) ? res.data : res.data?.results || [];
        const liveTagged = api.map((c) => ({ ...c, _live: true }));
        setCaregivers([...liveTagged, ...mockCaregivers]);
      })
      .catch((err) => {
        console.error("Error fetching caregivers:", err);
        setCaregivers(mockCaregivers);
      });
  }, []);

  // THEME STYLES
  const container =
    theme === "dark"
      ? "bg-gray-900 text-white"
      : "bg-gradient-to-b from-purple-50 to-white text-gray-900";
  const card =
    theme === "dark"
      ? "bg-gray-800"
      : "bg-purple-50 hover:bg-purple-100 transition-colors";
  const inputBase =
    "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600";

  const specializations = useMemo(() => {
    const set = new Set(["All"]);
    caregivers.forEach((c) => {
      if (c.specialization) set.add(c.specialization);
    });
    return Array.from(set);
  }, [caregivers]);

  const parseFee = (v) => {
    if (v === undefined || v === null || v === "") return null;
    const num = parseFloat(String(v).replace(/[^0-9.]/g, ""));
    return Number.isNaN(num) ? null : num;
  };

  const filteredCaregivers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = parseFee(minFee);
    const max = parseFee(maxFee);

    let list = caregivers.filter((c) => {
      const hay = `${c.name || ""} ${c.specialization || ""}`.toLowerCase();
      const matchesSearch = q.length ? hay.includes(q) : true;

      const matchesSpec =
        specialization === "All" ? true : c.specialization === specialization;

      const feeNum = parseFee(c.fees ?? c.hourly_fee);
      const matchesMin = min !== null ? (feeNum !== null ? feeNum >= min : false) : true;
      const matchesMax = max !== null ? (feeNum !== null ? feeNum <= max : false) : true;

      return matchesSearch && matchesSpec && matchesMin && matchesMax;
    });

    switch (sortKey) {
      case "price-asc":
        list.sort(
          (a, b) =>
            (parseFee(a.fees ?? a.hourly_fee) ?? Infinity) -
            (parseFee(b.fees ?? b.hourly_fee) ?? Infinity)
        );
        break;
      case "price-desc":
        list.sort(
          (a, b) =>
            (parseFee(b.fees ?? b.hourly_fee) ?? -Infinity) -
            (parseFee(a.fees ?? a.hourly_fee) ?? -Infinity)
        );
        break;
      case "name-asc":
        list.sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""))
        );
        break;
      case "live-first":
      default:
        list.sort((a, b) => Number(Boolean(b._live)) - Number(Boolean(a._live)));
        break;
    }

    return list;
  }, [caregivers, search, specialization, minFee, maxFee, sortKey]);

  const clearFilters = () => {
    setSearch("");
    setSpecialization("All");
    setMinFee("");
    setMaxFee("");
    setSortKey("live-first");
  };

  const normalizeFees = (fees) => {
    const n = typeof fees === "string" ? fees.replace(/[^0-9.]/g, "") : fees;
    const v = parseFloat(n);
    return isNaN(v) ? 0 : v;
  };

  const ensureLiveCaregiver = async (cg) => {
    if (cg?._live && (cg.id || cg.pk)) return cg;

    const payload = {
      name: cg.name || "Unknown",
      avatar: cg.avatar || "",
      specialization: cg.specialization || "General Care",
      qualification: cg.qualification || "—",
      fees: normalizeFees(cg.fees),
    };

    const res = await API.post("/api/caregivers/profiles/", payload);
    const created = { ...res.data, _live: true };

    setCaregivers((prev) =>
      prev.map((c) => {
        if (c.id === cg.id || c.name === cg.name) return created;
        return c;
      })
    );

    return created;
  };

  const openModal = (cg) => {
    setSelectedCaregiver(cg);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      time_slot: "09:00-10:00",
      notes: "",
    });
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    if (modalSubmitting) return;
    setModalOpen(false);
    setSelectedCaregiver(null);
    setModalError("");
  }, [modalSubmitting]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeModal();
    if (modalOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  const submitBooking = async () => {
    setModalError("");
    const access = localStorage.getItem("access"); // ✅ use JWT access
    if (!access) {
      navigate("/login", { state: { redirectTo: "/caregivers" } });
      return;
    }
    if (!selectedCaregiver) {
      setModalError("No caregiver selected.");
      return;
    }

    try {
      setModalSubmitting(true);
      setBusyId(selectedCaregiver.id || selectedCaregiver.pk || selectedCaregiver.name);

      const liveCg = await ensureLiveCaregiver(selectedCaregiver);

      const payload = {
        caregiver: liveCg.id || liveCg.pk,
        date: form.date,
        time_slot: form.time_slot,
        notes: form.notes || "",
      };

      const res = await API.post("/api/caregivers/bookings/", payload, {
        headers: { Authorization: `Bearer ${access}` }, // ✅ JWT Bearer
      });

      const booking = res.data;
      setModalOpen(false);
      navigate(`/booking/${booking.id}`, { state: { booking, caregiver: liveCg } });
    } catch (err) {
      const raw = err?.response?.data || err.message;
      console.error("Booking failed:", raw);
      if (typeof raw === "object") {
        const merged = Object.entries(raw)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setModalError(merged || "Booking failed. Please check your inputs.");
      } else {
        setModalError("Booking failed. Please try again.");
      }
    } finally {
      setModalSubmitting(false);
      setBusyId(null);
    }
  };

  return (
    <div className={`min-h-screen pt-24 px-4 transition-colors duration-300 ${container}`}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Available Caregivers</h1>

        {/* Controls bar */}
        <div className={`sticky top-20 z-10 ${theme === "dark" ? "bg-gray-900/80" : "bg-gray-100/80"} backdrop-blur rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialization…"
              className={`${inputBase} md:col-span-2`}
            />

            {/* Specialization */}
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className={inputBase}
            >
              {specializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Min / Max Fee */}
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
                placeholder="Min ₹"
                className={`${inputBase}`}
              />
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                placeholder="Max ₹"
                className={`${inputBase}`}
              />
            </div>

            {/* Sort */}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className={inputBase}
            >
              <option value="live-first">Live first</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="opacity-70">
              Showing <strong>{filteredCaregivers.length}</strong>{" "}
              caregiver{filteredCaregivers.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Cards */}
        {filteredCaregivers.length === 0 ? (
          <div className={`${card} rounded-2xl p-6 shadow text-center`}>
            <p className="opacity-75">No caregivers match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredCaregivers.map((c, idx) => {
                const idKey = c.id || c.pk || c.name;
                const fee = c.fees ?? c.hourly_fee ?? "—";

                return (
                  <motion.div
                    key={idKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18, delay: Math.min(idx * 0.02, 0.2) }}
                    className={`shadow-md rounded-xl p-5 md:p-6 flex items-center gap-4 md:gap-6 hover:shadow-lg transition-shadow cursor-default ${card}`}
                  >
                    {/* Avatar */}
                    <img
                      src={c.avatar || "https://via.placeholder.com/100"}
                      alt={c.name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg md:text-xl font-semibold truncate">{c.name}</h2>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            c._live
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {c._live ? "Live" : "Demo"}
                        </span>
                      </div>

                      <div className="mt-1 text-sm opacity-80 truncate">
                        {c.specialization || "General Care"}
                        {c.qualification ? <span className="ml-2">• {c.qualification}</span> : null}
                      </div>

                      <div className="mt-2 font-medium text-purple-600 dark:text-purple-300">
                        ₹ {fee} / hour
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <button
                        className={`px-4 py-2 rounded-lg text-white transition ${
                          busyId === idKey ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        onClick={() => {
                          setBusyId(idKey);
                          openModal(c);
                          setBusyId(null);
                        }}
                        disabled={busyId === idKey}
                        title="Book this caregiver"
                      >
                        {busyId === idKey ? "Opening…" : "Book Now"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div
            className={`relative w-full max-w-lg mx-4 rounded-2xl shadow-lg p-6 ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Book Caregiver</h2>

            {selectedCaregiver && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedCaregiver.avatar || "https://via.placeholder.com/80"}
                  alt={selectedCaregiver.name}
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <div className="font-semibold">{selectedCaregiver.name}</div>
                  <div className="opacity-80 text-sm">{selectedCaregiver.specialization}</div>
                  <div className="opacity-70 text-sm">{selectedCaregiver.qualification}</div>
                </div>
              </div>
            )}

            {modalError && <div className="mb-3 text-sm text-red-500">{modalError}</div>}

            <div className="grid gap-4">
              <div>
                <label className="block text-sm mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputBase}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Time Slot</label>
                <select
                  value={form.time_slot}
                  onChange={(e) => setForm((f) => ({ ...f, time_slot: e.target.value }))}
                  className={inputBase}
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className={`${inputBase} min-h-[90px]`}
                  placeholder="Any special instructions"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={modalSubmitting}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={submitBooking}
                disabled={modalSubmitting}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                {modalSubmitting && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                )}
                {modalSubmitting ? "Booking…" : "Confirm Booking"}
              </button>
            </div>

            <button
              onClick={closeModal}
              disabled={modalSubmitting}
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

export default CaregiverList;
