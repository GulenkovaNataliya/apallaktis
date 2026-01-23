"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the root page and redirect to language selection
    if (typeof window !== "undefined") {
      // Use replace to avoid adding to browser history
      router.replace("/language-select");
    }
  }, [router]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "var(--deep-teal, #01312d)"
    }}>
      <div style={{ color: "var(--polar, #fff)", fontSize: "18px" }}>
        Loading...
      </div>
    </div>
  );
}
