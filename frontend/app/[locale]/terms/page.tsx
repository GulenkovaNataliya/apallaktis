"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">Όροι χρήσης</h1>
        <p className="text-gray-600 mb-4">Terms of service content coming soon...</p>
        <Link href="/el" className="text-blue-600 hover:underline">
          ← Πίσω στην αρχική
        </Link>
      </div>
    </div>
  );
}
