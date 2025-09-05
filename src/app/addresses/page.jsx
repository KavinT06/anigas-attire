"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchAddresses, deleteAddress } from "../../services/api/addresses";
import Link from "next/link";
import AddressesProtectedRoute from "./ProtectedRoute";

function LoadingSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 rounded-lg p-4 h-32 w-full mb-4" />
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-100 text-red-700 p-4 rounded mb-4 flex items-center justify-between">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
      )}
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Delete Address</h2>
        <p className="mb-6">Are you sure you want to delete this address?</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const router = useRouter();

  const loadAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAddresses();
      setAddresses(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteAddress(deleteTarget.id);
      setShowConfirm(false);
      setDeleteTarget(null);
      loadAddresses();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete address.");
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteModal = (address) => {
    setDeleteTarget(address);
    setShowConfirm(true);
  };

  const closeDeleteModal = () => {
    setShowConfirm(false);
    setDeleteTarget(null);
  };

  return (
    <AddressesProtectedRoute>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Addresses</h1>
        {error && <ErrorBanner message={error} onRetry={loadAddresses} />}
        {loading ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : addresses.length === 0 ? (
          <div className="text-center text-gray-500 mb-8">
            No saved addresses. <Link href="/addresses/new" className="text-blue-600 underline">Add one now.</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-lg mb-1">{address.name}</div>
                  <div className="text-gray-700 text-sm mb-2">
                    {address.address}, {address.city}, {address.state}, {address.pincode}
                    {address.country && `, ${address.country}`}
                  </div>
                  <div className="text-gray-500 text-xs">Phone: {address.phone_number}</div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/addresses/${address.id}/edit`} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm" aria-label="Edit address">Edit</Link>
                  <button
                    onClick={() => openDeleteModal(address)}
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                    aria-label="Delete address"
                    disabled={deletingId === address.id}
                  >
                    {deletingId === address.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link href="/addresses/new" className="inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">Add New Address</Link>
        </div>
        <ConfirmModal open={showConfirm} onClose={closeDeleteModal} onConfirm={handleDelete} />
      </main>
    </AddressesProtectedRoute>
  );
}
