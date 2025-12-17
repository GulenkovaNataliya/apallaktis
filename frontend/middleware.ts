import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Match all pathnames except for:
  // - /api, /_next, /_vercel (Next.js internals)
  // - Static files (with dots)
  // - /language-select (no locale needed)
  matcher: ["/((?!api|_next|_vercel|language-select|.*\\..*).*)"],
};
