"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to language selection page
    router.push("/language-select");
  }, [router]);

  return null;
}
