"use client";

import React from "react";

export default function LogoutModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h3 className="font-semibold mb-2">Confirm Logout</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to sign out?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
