// components/MaintenanceOverlay.jsx
import React from "react";

export default function MaintenanceOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/90 text-white p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold">Site Under Maintenance</h1>
        <p className="text-lg">{message || "We are performing maintenance. Please try again later."}</p>
        <p className="text-sm text-gray-300">
          If you are an administrator, you can continue to use the site.
        </p>
      </div>
    </div>
  );
}
