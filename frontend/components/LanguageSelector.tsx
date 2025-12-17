"use client";

import { useRouter } from "next/navigation";
import { locales, languageNames, type Locale } from "@/i18n";

export default function LanguageSelector() {
  const router = useRouter();

  const handleLanguageSelect = (locale: Locale) => {
    // Save selected language to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedLanguage", locale);
    }
    // Redirect to the welcome page with selected locale
    router.push(`/${locale}`);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      {/* Slogan - centered - ВСЕГДА с восклицательным знаком! */}
      <h1
        className="text-center text-slogan font-semibold"
        style={{ color: "#ff8f0a", width: "75%" }}
      >
        Τέλος στη ρουτίνα!
      </h1>

      {/* Language selection grid: 2 columns × 4 rows */}
      <div className="grid w-full grid-cols-2 gap-3">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLanguageSelect(locale)}
            className="text-button rounded-xl font-medium transition-all active:scale-95"
            style={{
              backgroundColor: "var(--polar)",
              color: "var(--deep-teal)",
              boxShadow: "0 4px 8px var(--deep-teal)",
              minHeight: "52px",
              padding: "0 24px",
            }}
          >
            {languageNames[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
