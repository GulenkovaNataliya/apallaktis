"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { type Locale } from "@/lib/messages";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export default function AdminNavigation() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as Locale) || "el";

  const navItems: NavItem[] = [
    { href: `/${locale}/admin`, label: "Dashboard", icon: "📊" },
    { href: `/${locale}/admin/users`, label: "Users", icon: "👥" },
    { href: `/${locale}/admin/vip`, label: "VIP", icon: "⭐" },
    { href: `/${locale}/admin/payments`, label: "Payments", icon: "💰" },
    { href: `/${locale}/admin/referrals`, label: "Referrals", icon: "🎁" },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      style={{ backgroundColor: "var(--deep-teal)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo/Title */}
        <button
          onClick={() => router.push(`/${locale}/admin`)}
          className="text-lg font-bold"
          style={{ color: "#ff8f0a" }}
        >
          ADMIN
        </button>

        {/* Navigation Items */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: isActive(item.href)
                  ? "rgba(255, 143, 10, 0.2)"
                  : "transparent",
                color: isActive(item.href) ? "#ff8f0a" : "rgba(255, 255, 255, 0.8)",
              }}
            >
              <span className="mr-1">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Back to App */}
        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          🏠 <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </nav>
  );
}
