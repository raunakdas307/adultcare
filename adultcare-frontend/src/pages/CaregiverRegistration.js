import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function CaregiverRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    qualification: "",
    fees: "",
    avatar: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [avatarOk, setAvatarOk] = useState(true);

  const specializationOptions = useMemo(
    () => [
      "Elderly Care",
      "Home Nursing",
      "Post-Surgery Care",
      "Child Care",
      "Special Needs Care",
      "Rehabilitation Support",
      "Physiotherapy",
      "Disability Support",
      "Newborn Care",
      "Palliative Care",
    ],
    []
  );

  const validate = (data) => {
    const e = {};
    if (!data.name?.trim()) e.name = "Please enter full name.";
    if (!data.specialization?.trim())
      e.specialization = "Please choose a specialization.";
    if (!data.qualification?.trim())
      e.qualification = "Please enter a qualification.";
    const feeNum = Number(data.fees);
    if (data.fees === "" || isNaN(feeNum) || feeNum < 0)
      e.fees = "Enter a valid non-negative amount.";
    if (data.avatar?.trim()) {
      try {
        new URL(data.avatar.trim());
      } catch {
        e.avatar = "Enter a valid URL (or leave blank).";
      }
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) setErrors(validate(next));
    if (name === "avatar") setAvatarOk(true);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const t = { ...touched, [name]: true };
    setTouched(t);
    setErrors(validate(formData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const v = validate(formData);
    setErrors(v);
    setTouched({
      name: true,
      specialization: true,
      qualification: true,
      fees: true,
      avatar: !!formData.avatar,
    });
    if (Object.keys(v).length) return;

    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login", { state: { redirectTo: "/caregiver-registration" } });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        fees: parseFloat(formData.fees) || 0,
        avatar: formData.avatar?.trim() || "",
      };

      await API.post("/api/caregivers/profiles/", payload, {
        headers: { Authorization: `Bearer ${access}` },
      });

      setServerSuccess("🎉 Registration successful! Taking you to caregivers…");
      setTimeout(() => navigate("/caregivers"), 1100);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login", { state: { redirectTo: "/caregiver-registration" } });
        return;
      }
      console.error(err.response?.data || err.message);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const serverMsgs = Object.entries(data)
          .map(
            ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
          )
          .join(" | ");
        setServerError(
          serverMsgs || "Registration failed. Please check your inputs."
        );
      } else {
        setServerError("Registration failed. Please check your inputs.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600";

  const labelBase =
    "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200";
  const hintBase = "text-xs mt-1 text-gray-500 dark:text-gray-400";
  const errText = "text-xs mt-1 text-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-black px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-purple-700 dark:text-purple-400">
            Caregiver Registration
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Create your caregiver profile. You can edit it later.
          </p>
        </div>

        {/* Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Avatar Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 sticky top-24">
              <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">
                Profile Preview
              </div>
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={
                      avatarOk && formData.avatar?.trim()
                        ? formData.avatar
                        : "https://via.placeholder.com/160"
                    }
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full object-cover border"
                    onError={() => setAvatarOk(false)}
                  />
                  {formData.fees !== "" && !isNaN(Number(formData.fees)) && (
                    <span className="absolute -bottom-2 right-0 text-[10px] px-2 py-[2px] rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                      ₹ {formData.fees}/hr
                    </span>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {formData.name || "Your Name"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formData.specialization || "Specialization"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.qualification || "Qualification"}
                  </div>
                </div>
                <p className="text-xs mt-3 text-gray-500 dark:text-gray-400 text-center">
                  Use a square image URL (e.g. 400×400) for best results.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
            >
              {/* server messages */}
              {serverError && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200">
                  {serverError}
                </div>
              )}
              {serverSuccess && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200">
                  {serverSuccess}
                </div>
              )}

              {/* Name */}
              <div className="mb-4">
                <label className={labelBase} htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Laura Davis"
                  className={inputBase}
                  autoComplete="name"
                />
                {touched.name && errors.name && (
                  <p className={errText}>{errors.name}</p>
                )}
              </div>

              {/* Specialization */}
              <div className="mb-4">
                <label className={labelBase} htmlFor="specialization">
                  Specialization
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputBase}
                  >
                    <option value="">Select specialization</option>
                    {specializationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Or type your own"
                    className={inputBase}
                  />
                </div>
                <p className={hintBase}>Pick from list or type a custom one.</p>
                {touched.specialization && errors.specialization && (
                  <p className={errText}>{errors.specialization}</p>
                )}
              </div>

              {/* Qualification */}
              <div className="mb-4">
                <label className={labelBase} htmlFor="qualification">
                  Qualification
                </label>
                <input
                  id="qualification"
                  name="qualification"
                  type="text"
                  value={formData.qualification}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. BSc in Physiotherapy"
                  className={inputBase}
                />
                {touched.qualification && errors.qualification && (
                  <p className={errText}>{errors.qualification}</p>
                )}
              </div>

              {/* Fees */}
              <div className="mb-4">
                <label className={labelBase} htmlFor="fees">
                  Fees (per hour)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    id="fees"
                    name="fees"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.fees}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="₹"
                    className={`${inputBase} col-span-1`}
                  />
                  <div className="col-span-2 flex gap-2">
                    {[200, 300, 500].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:opacity-90 transition text-sm"
                        onClick={() => {
                          const next = { ...formData, fees: String(v) };
                          setFormData(next);
                          if (touched.fees) setErrors(validate(next));
                        }}
                      >
                        ₹ {v}
                      </button>
                    ))}
                  </div>
                </div>
                {touched.fees && errors.fees && (
                  <p className={errText}>{errors.fees}</p>
                )}
              </div>

              {/* Avatar URL */}
              <div className="mb-6">
                <label className={labelBase} htmlFor="avatar">
                  Avatar URL (optional)
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="url"
                  inputMode="url"
                  value={formData.avatar}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://example.com/your-photo.jpg"
                  className={inputBase}
                />
                <p className={hintBase}>
                  Paste a direct image link (jpg, png, webp). Leave blank to use
                  a placeholder.
                </p>
                {touched.avatar && errors.avatar && (
                  <p className={errText}>{errors.avatar}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-lg text-white transition flex items-center gap-2 ${
                    submitting
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {submitting && (
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  {submitting ? "Submitting…" : "Submit"}
                </button>

                <Link
                  to="/caregivers"
                  className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition"
                >
                  Cancel
                </Link>
              </div>
            </form>

            <p className="text-xs mt-3 text-gray-500 dark:text-gray-400">
              Tip: After registering, your profile appears in the caregivers
              list and can be booked by families.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
