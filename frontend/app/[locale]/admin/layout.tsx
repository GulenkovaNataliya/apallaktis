"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  useEffect(() => {
    // Админка доступна только на русском языке
    if (locale !== "ru") {
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(`/${locale}/admin`, "/ru/admin");
      router.replace(newPath);
    }
  }, [locale, router]);

  // Override mobile preview styles for admin (desktop full-width)
  useEffect(() => {
    // Override body styles
    document.body.style.backgroundColor = "#fff";
    document.body.style.display = "block";
    document.body.style.justifyContent = "initial";
    document.body.style.alignItems = "initial";

    // Find and override mobile-preview-wrapper
    const wrapper = document.querySelector(".mobile-preview-wrapper") as HTMLElement;
    if (wrapper) {
      wrapper.style.maxWidth = "100%";
      wrapper.style.width = "100%";
      wrapper.style.borderRadius = "0";
      wrapper.style.boxShadow = "none";
      wrapper.style.margin = "0";
    }

    return () => {
      // Restore styles when leaving admin
      document.body.style.backgroundColor = "";
      document.body.style.display = "";
      document.body.style.justifyContent = "";
      document.body.style.alignItems = "";

      if (wrapper) {
        wrapper.style.maxWidth = "";
        wrapper.style.width = "";
        wrapper.style.borderRadius = "";
        wrapper.style.boxShadow = "";
        wrapper.style.margin = "";
      }
    };
  }, []);

  // Если не русский язык, показываем загрузку пока идёт редирект
  if (locale !== "ru") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
