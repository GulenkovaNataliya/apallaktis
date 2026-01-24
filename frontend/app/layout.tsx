import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://apallaktis.com"),
  title: "ΑΠΑΛΛΑΚΤΗΣ - Τέλος στη ρουτίνα!",
  description: "Τέλος στη ρουτίνα! Εργαλείο προσωπικού οικονομικού ελέγχου για επαγγελματίες.",
  applicationName: "ΑΠΑΛΛΑΚΤΗΣ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ΑΠΑΛΛΑΚΤΗΣ",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ΑΠΑΛΛΑΚΤΗΣ - Τέλος στη ρουτίνα!",
    description: "Τέλος στη ρουτίνα! Εργαλείο προσωπικού οικονομικού ελέγχου για επαγγελματίες.",
    images: ["/icon-512.png"],
    siteName: "ΑΠΑΛΛΑΚΤΗΣ",
    locale: "el_GR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#01312d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ΑΠΑΛΛΑΚΤΗΣ" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Service Worker Registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[PWA] Service Worker registered:', registration.scope);
                    },
                    function(err) {
                      console.log('[PWA] Service Worker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
