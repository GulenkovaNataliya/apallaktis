"use client";

import { useRouter } from "next/navigation";

// Fixed language order as per spec
const languages = [
  { code: "el", name: "Ελληνικά" },
  { code: "ru", name: "Русский" },
  { code: "uk", name: "Українська" },
  { code: "sq", name: "Shqip" },
  { code: "bg", name: "Български" },
  { code: "ro", name: "Română" },
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
];

export default function LanguageSelector() {
  const router = useRouter();

  const handleLanguageSelect = (code: string) => {
    // Save selected language to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedLanguage", code);
    }
    // Navigate to welcome page with selected locale
    router.push(`/${code}/welcome`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Language grid - 2 columns × 4 rows */}
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            className="btn-language text-button rounded-lg px-6 py-4 font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--polar)",
              color: "var(--deep-teal)",
              boxShadow: "0 4px 8px var(--deep-teal)",
            }}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
