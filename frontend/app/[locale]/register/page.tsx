"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Δημιουργία λογαριασμού</h1>
        <p className="text-gray-600 mb-4">Coming soon...</p>
        <Link href="/el" className="text-blue-600 hover:underline">
          ← Πίσω στην αρχική
        </Link>
      </div>
    </div>
  );
}
