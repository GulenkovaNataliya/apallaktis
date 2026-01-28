"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page redirects to the new admin panel at /admin
export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <p>Перенаправление...</p>
    </div>
  );
}
