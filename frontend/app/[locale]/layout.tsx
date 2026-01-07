import { Noto_Sans, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

// Load Noto Sans for all languages
const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic", "greek"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

// Load Noto Sans Arabic for Arabic
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-arabic",
  display: "swap",
});

// RTL languages
const rtlLocales = ["ar"];

function isRTL(locale: string): boolean {
  return rtlLocales.includes(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = isRTL(locale) ? "rtl" : "ltr";

  return (
    <div lang={locale} dir={dir} className={`${notoSans.variable} ${notoSansArabic.variable}`}>
      <AuthProvider>
        {/* Mobile viewport wrapper for desktop preview */}
        <div className="mobile-preview-wrapper">{children}</div>
      </AuthProvider>
    </div>
  );
}
