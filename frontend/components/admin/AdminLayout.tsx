'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  locale: string;
}

export default function AdminLayout({ children, locale }: AdminLayoutProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: `/${locale}/admin`, icon: '📊' },
    { name: 'Users', href: `/${locale}/admin/users`, icon: '👥' },
    { name: 'VIP Activation', href: `/${locale}/admin/vip`, icon: '⭐' },
    { name: 'Payments', href: `/${locale}/admin/payments`, icon: '💰' },
    { name: 'Referrals', href: `/${locale}/admin/referrals`, icon: '🎁' },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/${locale}/admin`} className="text-xl font-bold text-blue-600">
                ΑΠΑΛΛΑΚΤΗΣ Admin
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/${locale}/dashboard`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-4 mb-8 overflow-x-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap
                ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
