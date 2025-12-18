"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";

export default function TermsPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.terms || messages.el.terms;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">{t.title}</h1>
        <p className="text-gray-600 mb-4">{t.content}</p>
        <Link href={`/${locale}`} className="text-blue-600 hover:underline">
          {t.backToHome}
        </Link>
      </div>
    </div>
  );
}
