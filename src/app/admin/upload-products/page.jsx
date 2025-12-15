"use client";

import UploadProducts from "./UploadProducts";

export default function AdminUploadPage() {
  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Upload Products to Firestore</h1>
      <UploadProducts />
    </div>
  );
}
