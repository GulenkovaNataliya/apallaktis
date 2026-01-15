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
