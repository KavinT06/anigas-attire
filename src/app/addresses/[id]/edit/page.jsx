"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { fetchAddresses, updateAddress } from "../../../../services/api/addresses";
import AddressesProtectedRoute from "../../ProtectedRoute";

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchAddresses();
        const addr = res.data.find((a) => String(a.id) === String(id));
        if (!addr) throw new Error("Address not found");
        setForm(addr);
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || "Failed to load address.");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setErrors({});
    try {
      await updateAddress(id, form);
      router.push("/addresses");
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setError("Failed to update address.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-lg mx-auto px-4 py-8 animate-pulse">Loading...</div>;
  }
  if (error) {
    return <div className="max-w-lg mx-auto px-4 py-8 text-red-600">{error}</div>;
  }
  if (!form) return null;

  return (
    <AddressesProtectedRoute>
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Address</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block font-medium mb-1">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label htmlFor="phone_number" className="block font-medium mb-1">Phone Number</label>
            <input id="phone_number" name="phone_number" value={form.phone_number} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.phone_number && <div className="text-red-600 text-sm mt-1">{errors.phone_number}</div>}
          </div>
          <div>
            <label htmlFor="address" className="block font-medium mb-1">Street Address</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.address && <div className="text-red-600 text-sm mt-1">{errors.address}</div>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block font-medium mb-1">City</label>
              <input id="city" name="city" value={form.city} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.city && <div className="text-red-600 text-sm mt-1">{errors.city}</div>}
            </div>
            <div>
              <label htmlFor="state" className="block font-medium mb-1">State</label>
              <input id="state" name="state" value={form.state} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.state && <div className="text-red-600 text-sm mt-1">{errors.state}</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pincode" className="block font-medium mb-1">Postal Code</label>
              <input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.pincode && <div className="text-red-600 text-sm mt-1">{errors.pincode}</div>}
            </div>
            <div>
              <label htmlFor="country" className="block font-medium mb-1">Country</label>
              <input id="country" name="country" value={form.country} onChange={handleChange} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.country && <div className="text-red-600 text-sm mt-1">{errors.country}</div>}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={() => router.push("/addresses")} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-60">
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </AddressesProtectedRoute>
  );
}
