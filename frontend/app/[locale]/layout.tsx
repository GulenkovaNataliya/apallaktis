import { Noto_Sans, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

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

  return (
    <html lang={locale} dir={isRTL(locale) ? "rtl" : "ltr"}>
      <head>
        <title>ΑΠΑΛΛΑΚΤΗΣ - Τέλος στη ρουτίνα!</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body className={`${notoSans.variable} ${notoSansArabic.variable}`}>
        {/* Mobile viewport wrapper for desktop preview */}
        <div className="mobile-preview-wrapper">{children}</div>
      </body>
    </html>
  );
}
