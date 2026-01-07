import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { messages } from "./lib/messages";

// Fixed language order as per spec
export const locales = ["el", "ru", "uk", "sq", "bg", "ro", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "el";

// RTL languages
export const rtlLocales: Locale[] = ["ar"];

// Language display names (native)
export const languageNames: Record<Locale, string> = {
  el: "Ελληνικά",
  ru: "Русский",
  uk: "Українська",
  sq: "Shqip",
  bg: "Български",
  ro: "Română",
  en: "English",
  ar: "العربية",
};

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) notFound();

  return {
    locale: locale as string,
    messages: messages[locale as Locale],
  };
});
