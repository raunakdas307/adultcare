import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import API from '../api';
import {
  Users,
  CalendarCheck2,
  Clock4,
  Ban,
  Pencil,
  Trash2,
  Check,
  Loader2,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';

// Theme helpers
const containerClass = (theme) =>
  theme === 'dark'
    ? 'bg-gray-900 text-white'
    : 'bg-gradient-to-b from-purple-50 to-white text-gray-900';

const cardClass = (theme) =>
  theme === 'dark'
    ? 'bg-gray-800'
    : 'bg-purple-50 hover:bg-purple-100 transition-colors';

const softBorder = (theme) =>
  theme === 'dark' ? 'border-gray-700' : 'border-purple-100';

const inputClass = (theme) =>
  `w-full px-3 py-2 rounded-lg border ${softBorder(theme)} ${
    theme === 'dark'
      ? 'bg-gray-700 text-gray-100'
      : 'bg-white text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-purple-600`;

export default function AdminDashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [tab, setTab] = useState('caregivers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null); // store logged-in user

  // data
  const [caregivers, setCaregivers] = useState([]);
  const [bookings, setBookings] = useState([]);

  // ui state
  const [searchCg, setSearchCg] = useState('');
  const [sortCgBy, setSortCgBy] = useState('name');
  const [searchBk, setSearchBk] = useState('');
  const [statusBk, setStatusBk] = useState('all');
  const [sortBkBy, setSortBkBy] = useState('new');
  const [reloading, setReloading] = useState(false);

  // modals
  const [editCg, setEditCg] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // toast
  const [toast, setToast] = useState(null);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2000);
  };

  const handle401 = () => {
    navigate('/login', { state: { redirectTo: '/admin-dashboard' } });
  };

  // Fetch user info (role check) + dashboard data
  const fetchAll = async () => {
    try {
      setReloading(true);
      setError('');

      // 1) Check current user
      const meRes = await API.get('/api/users/me/');
      setUser(meRes.data);

      if (meRes.data.role !== 'admin') {
        setError('❌ You are not authorized to view this page.');
        return;
      }

      // 2) Fetch caregivers + bookings
      const [cgRes, bkRes] = await Promise.all([
        API.get('/api/caregivers/profiles/'),
        API.get('/api/caregivers/bookings/'),
      ]);

      const cgData = Array.isArray(cgRes.data)
        ? cgRes.data
        : cgRes.data.results || [];
      const bkData = Array.isArray(bkRes.data)
        ? bkRes.data
        : bkRes.data.results || [];

      setCaregivers(cgData);
      setBookings(bkData);
    } catch (err) {
      if (err?.response?.status === 401) return handle401();
      console.error('Admin load error:', err?.response?.data || err.message);
      setError(
        err?.response?.status === 403
          ? '❌ You are not authorized to view this page.'
          : 'Failed to load dashboard data.'
      );
    } finally {
      setReloading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { redirectTo: '/admin-dashboard' } });
      return;
    }
    (async () => {
      setLoading(true);
      await fetchAll();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  /** Stats */
  const stats = useMemo(() => {
    const totalCg = caregivers.length;
    const totalBk = bookings.length;
    const confirmed = bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'confirmed'
    ).length;
    const pending = bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'pending'
    ).length;
    const cancelled = bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'cancelled'
    ).length;
    return { totalCg, totalBk, confirmed, pending, cancelled };
  }, [caregivers, bookings]);

  /** Caregiver filters */
  const filteredCaregivers = useMemo(() => {
    let list = caregivers.slice();
    const q = searchCg.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const name = (c.name || '').toLowerCase();
        const spec = (c.specialization || '').toLowerCase();
        const qual = (c.qualification || '').toLowerCase();
        return name.includes(q) || spec.includes(q) || qual.includes(q);
      });
    }
    if (sortCgBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortCgBy === 'fees') {
      list.sort((a, b) => Number(a.fees ?? 0) - Number(b.fees ?? 0));
    }
    return list;
  }, [caregivers, searchCg, sortCgBy]);

  /** Booking filters */
  const filteredBookings = useMemo(() => {
    let list = bookings.slice();
    const q = searchBk.trim().toLowerCase();
    if (statusBk !== 'all') {
      list = list.filter(
        (b) => (b.status || '').toLowerCase() === statusBk
      );
    }
    if (q) {
      list = list.filter(
        (b) =>
          String(b.id || '').includes(q) ||
          String(b.caregiver || '').includes(q)
      );
    }
    list.sort((a, b) =>
      sortBkBy === 'old'
        ? a.date.localeCompare(b.date) || a.id - b.id
        : b.date.localeCompare(a.date) || b.id - a.id
    );
    return list;
  }, [bookings, searchBk, statusBk, sortBkBy]);

  /** Booking actions */
  const patchBookingStatus = async (id, status) => {
    try {
      await API.patch(`/api/caregivers/bookings/${id}/`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      showToast('success', `Booking #${id} → ${status}`);
    } catch (err) {
      if (err?.response?.status === 401) return handle401();
      console.error(
        'Booking status patch failed:',
        err?.response?.data || err.message
      );
      showToast('error', 'Failed to update booking status.');
    }
  };

  /** Caregiver actions */
  const openEditCaregiver = (c) => {
    setEditCg({
      id: c.id,
      name: c.name || '',
      specialization: c.specialization || '',
      qualification: c.qualification || '',
      fees: String(c.fees ?? ''),
      avatar: c.avatar || '',
    });
  };

  const saveCaregiver = async () => {
    if (!editCg?.id) return;
    try {
      setSaveLoading(true);
      const payload = {
        name: editCg.name,
        specialization: editCg.specialization,
        qualification: editCg.qualification,
        fees: parseFloat(editCg.fees || 0),
        avatar: editCg.avatar,
      };
      await API.patch(`/api/caregivers/profiles/${editCg.id}/`, payload);
      setCaregivers((prev) =>
        prev.map((c) =>
          c.id === editCg.id ? { ...c, ...payload } : c
        )
      );
      setEditCg(null);
      showToast('success', 'Caregiver saved');
    } catch (err) {
      if (err?.response?.status === 401) return handle401();
      console.error(
        'Save caregiver failed:',
        err?.response?.data || err.message
      );
      showToast('error', 'Failed to save caregiver.');
    } finally {
      setSaveLoading(false);
    }
  };

  const confirmDeleteCaregiver = (id) => setDeleteId(id);
  const closeDelete = () => !deleting && setDeleteId(null);

  const deleteCaregiver = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await API.delete(`/api/caregivers/profiles/${deleteId}/`);
      setCaregivers((prev) =>
        prev.filter((c) => c.id !== deleteId)
      );
      setDeleteId(null);
      showToast('success', 'Caregiver deleted');
    } catch (err) {
      if (err?.response?.status === 401) return handle401();
      console.error(
        'Delete caregiver failed:',
        err?.response?.data || err.message
      );
      showToast('error', 'Failed to delete caregiver.');
    } finally {
      setDeleting(false);
    }
  };

  const badge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed')
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    if (s === 'cancelled')
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
  };

  const caregiversById = useMemo(() => {
    const map = new Map();
    for (const c of caregivers) {
      const id = c.id ?? c.pk;
      if (id != null) map.set(id, c);
    }
    return map;
  }, [caregivers]);

  if (!loading && user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            You are not authorized to view this page.
          </p>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }
    <div
      className={`min-h-screen pt-24 pb-10 px-4 ${containerClass(theme)}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header / Banner */}
        <div className="rounded-2xl overflow-hidden shadow mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-white/90 text-sm">Manage caregivers and bookings</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/caregiver-registration"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                >
                  <Plus className="w-4 h-4" /> New Caregiver
                </Link>
                <button
                  onClick={fetchAll}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                >
                  {reloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Caregivers', value: stats.totalCg, Icon: Users },
            { label: 'Bookings', value: stats.totalBk, Icon: CalendarCheck2 },
            { label: 'Confirmed', value: stats.confirmed, Icon: Check },
            { label: 'Pending', value: stats.pending, Icon: Clock4 },
            { label: 'Cancelled', value: stats.cancelled, Icon: Ban },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className={`${cardClass(theme)} border ${softBorder(theme)} rounded-2xl p-4 shadow flex items-center gap-3`}
            >
              <div className="rounded-xl p-2 bg-white/50 dark:bg-white/10">
                <Icon className="w-5 h-5 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <div className="text-sm opacity-70">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs / Controls */}
        <div className={`${cardClass(theme)} border ${softBorder(theme)} rounded-2xl shadow p-3 mb-4 sticky top-20 z-10`}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTab('caregivers')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                tab === 'caregivers' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Caregivers
            </button>
            <button
              onClick={() => setTab('bookings')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                tab === 'bookings' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Bookings
            </button>

            <div className="flex-1" />

            {/* Search contextual */}
            {tab === 'caregivers' ? (
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-60" />
                <input
                  value={searchCg}
                  onChange={(e) => setSearchCg(e.target.value)}
                  placeholder="Search caregivers (name, spec, qualification)"
                  className={`${inputClass(theme)} pl-9`}
                />
              </div>
            ) : (
              <div className="flex w-full sm:w-auto gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-60" />
                  <input
                    value={searchBk}
                    onChange={(e) => setSearchBk(e.target.value)}
                    placeholder="Search by booking ID / caregiver ID"
                    className={`${inputClass(theme)} pl-9`}
                  />
                </div>
                <select
                  value={statusBk}
                  onChange={(e) => setStatusBk(e.target.value)}
                  className={inputClass(theme)}
                  title="Status"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className={`${cardClass(theme)} border ${softBorder(theme)} rounded-2xl p-6 shadow mb-4`}>
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className={`${cardClass(theme)} border ${softBorder(theme)} rounded-2xl p-6 shadow mb-4`}>
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        )}

        {/* Caregivers Tab */}
        {!loading && !error && tab === 'caregivers' && (
          <div className={`${cardClass(theme)} border ${softBorder(theme)} rounded-2xl p-4 shadow`}>
            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <select
                value={sortCgBy}
                onChange={(e) => setSortCgBy(e.target.value)}
                className={`w-full sm:w-48 ${inputClass(theme)}`}
              >
                <option value="name">Sort: Name</option>
                <option value="fees">Sort: Fees</option>
              </select>
              <div className="flex-1" />
              <Link
                to="/caregiver-registration"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" /> New Caregiver
              </Link>
            </div>

            {/* List */}
            {filteredCaregivers.length === 0 ? (
              <div className="text-center opacity-75 py-8">No caregivers found.</div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto -mx-2 sm:mx-0">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left opacity-70">
                        <th className="py-2 px-3">Caregiver</th>
                        <th className="py-2 px-3">Specialization</th>
                        <th className="py-2 px-3">Qualification</th>
                        <th className="py-2 px-3">Fees</th>
                        <th className="py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCaregivers.map((c) => (
                        <tr
                          key={c.id}
                          className="border-t last:border-b transition hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={c.avatar || 'https://via.placeholder.com/64'}
                                alt={c.name}
                                className="w-10 h-10 rounded-full object-cover border"
                              />
                              <div>
                                <div className="font-semibold">{c.name}</div>
                                <div className="opacity-70 text-xs">ID: {c.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">{c.specialization || '—'}</td>
                          <td className="py-3 px-3">{c.qualification || '—'}</td>
                          <td className="py-3 px-3">₹ {c.fees ?? '—'}</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <button
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition mr-2"
                              onClick={() => openEditCaregiver(c)}
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </button>
                            <button
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                              onClick={() => confirmDeleteCaregiver(c.id)}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredCaregivers.map((c) => (
                    <div key={c.id} className={`p-4 rounded-2xl border ${softBorder(theme)} shadow`}>
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar || 'https://via.placeholder.com/64'}
                          alt={c.name}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                        <div>
                          <div className="font-semibold">{c.name}</div>
                          <div className="opacity-70 text-xs">ID: {c.id}</div>
                          <div className="text-sm mt-1 opacity-80">{c.specialization || '—'}</div>
                          <div className="text-sm opacity-70">{c.qualification || '—'}</div>
                        </div>
                        <div className="ml-auto font-semibold">₹ {c.fees ?? '—'}</div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                          onClick={() => openEditCaregiver(c)}
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                          onClick={() => confirmDeleteCaregiver(c.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {!loading && !error && tab === 'bookings' && (
          <div className={`${cardClass(theme)} border ${softBorder(theme)} rounded-2xl p-4 shadow`}>
            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
              <select
                value={sortBkBy}
                onChange={(e) => setSortBkBy(e.target.value)}
                className={inputClass(theme)}
              >
                <option value="new">Newest first</option>
                <option value="old">Oldest first</option>
              </select>
              <select
                value={statusBk}
                onChange={(e) => setStatusBk(e.target.value)}
                className={inputClass(theme)}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="sm:col-span-2">
                <input
                  value={searchBk}
                  onChange={(e) => setSearchBk(e.target.value)}
                  placeholder="Search booking ID / caregiver ID"
                  className={inputClass(theme)}
                />
              </div>
            </div>

            {/* List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center opacity-75 py-8">No bookings found.</div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto -mx-2 sm:mx-0">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left opacity-70">
                        <th className="py-2 px-3">Booking</th>
                        <th className="py-2 px-3">Caregiver</th>
                        <th className="py-2 px-3">Date / Slot</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => {
                        const cg = caregiversById.get(b.caregiver);
                        return (
                          <tr
                            key={b.id}
                            className="border-t last:border-b transition hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <td className="py-3 px-3">
                              <div className="font-semibold">#{b.id}</div>
                              <div className="opacity-70 text-xs">
                                {b.notes ? `Notes: ${b.notes}` : '—'}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {cg?.name ? cg.name : `#${b.caregiver}`}
                            </td>
                            <td className="py-3 px-3">
                              <div>{b.date}</div>
                              <div className="opacity-70 text-xs">{b.time_slot}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded ${badge(b.status)}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <button
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition mr-2 disabled:opacity-50"
                                onClick={() => patchBookingStatus(b.id, 'confirmed')}
                                disabled={(b.status || '').toLowerCase() === 'confirmed'}
                              >
                                <Check className="w-4 h-4" /> Confirm
                              </button>
                              <button
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition mr-2"
                                onClick={() => patchBookingStatus(b.id, 'pending')}
                              >
                                <Clock4 className="w-4 h-4" /> Pending
                              </button>
                              <button
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                                onClick={() => patchBookingStatus(b.id, 'cancelled')}
                                disabled={(b.status || '').toLowerCase() === 'cancelled'}
                              >
                                <Ban className="w-4 h-4" /> Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredBookings.map((b) => {
                    const cg = caregiversById.get(b.caregiver);
                    return (
                      <div key={b.id} className={`p-4 rounded-2xl border ${softBorder(theme)} shadow`}>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">Booking #{b.id}</div>
                          <span className={`px-2 py-0.5 rounded text-xs ${badge(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="mt-2 text-sm">
                          <div>
                            <span className="opacity-70">Caregiver:</span>{' '}
                            {cg?.name ? cg.name : `#${b.caregiver}`}
                          </div>
                          <div>
                            <span className="opacity-70">Date:</span> {b.date}
                          </div>
                          <div>
                            <span className="opacity-70">Slot:</span> {b.time_slot}
                          </div>
                          {b.notes ? (
                            <div className="opacity-80 mt-1">
                              <span className="opacity-70">Notes:</span> {b.notes}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <button
                            className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                            onClick={() => patchBookingStatus(b.id, 'confirmed')}
                            disabled={(b.status || '').toLowerCase() === 'confirmed'}
                          >
                            Confirm
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition"
                            onClick={() => patchBookingStatus(b.id, 'pending')}
                          >
                            Pending
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                            onClick={() => patchBookingStatus(b.id, 'cancelled')}
                            disabled={(b.status || '').toLowerCase() === 'cancelled'}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[70] px-4 py-2 rounded-lg shadow text-white ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {toast.msg}
          </div>
        )}
      </div>

      {/* Edit Caregiver Modal */}
      {editCg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !saveLoading && setEditCg(null)} />
          <div
            className={`relative w-full max-w-lg mx-4 rounded-2xl shadow-lg p-6 ${cardClass(theme)} border ${softBorder(theme)}`}
          >
            <h3 className="text-lg font-semibold mb-3">Edit Caregiver</h3>

            <div className="grid gap-3">
              <div>
                <label className="text-sm opacity-80">Name</label>
                <input
                  className={inputClass(theme)}
                  value={editCg.name}
                  onChange={(e) => setEditCg({ ...editCg, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm opacity-80">Specialization</label>
                <input
                  className={inputClass(theme)}
                  value={editCg.specialization}
                  onChange={(e) => setEditCg({ ...editCg, specialization: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm opacity-80">Qualification</label>
                <input
                  className={inputClass(theme)}
                  value={editCg.qualification}
                  onChange={(e) => setEditCg({ ...editCg, qualification: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm opacity-80">Fees (₹/hr)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass(theme)}
                  value={editCg.fees}
                  onChange={(e) => setEditCg({ ...editCg, fees: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm opacity-80">Avatar URL</label>
                <input
                  className={inputClass(theme)}
                  value={editCg.avatar}
                  onChange={(e) => setEditCg({ ...editCg, avatar: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditCg(null)}
                disabled={saveLoading}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
              >
                Close
              </button>
              <button
                onClick={saveCaregiver}
                disabled={saveLoading}
                className={`px-4 py-2 rounded-lg text-white transition inline-flex items-center gap-2 ${
                  saveLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {saveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {saveLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            <button
              onClick={() => setEditCg(null)}
              disabled={saveLoading}
              className="absolute top-3 right-3 text-sm opacity-70 hover:opacity-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Delete Caregiver Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeDelete} />
          <div
            className={`relative w-full max-w-md mx-4 rounded-2xl shadow-lg p-6 ${cardClass(theme)} border ${softBorder(theme)}`}
          >
            <h3 className="text-lg font-semibold">Delete this caregiver?</h3>
            <p className="text-sm opacity-80 mt-2">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
              >
                Close
              </button>
              <button
                onClick={deleteCaregiver}
                disabled={deleting}
                className={`px-4 py-2 rounded-lg text-white transition inline-flex items-center gap-2 ${
                  deleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
            <button
              onClick={closeDelete}
              disabled={deleting}
              className="absolute top-3 right-3 text-sm opacity-70 hover:opacity-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
}
