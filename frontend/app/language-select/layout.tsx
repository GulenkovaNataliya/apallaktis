import { Noto_Sans } from "next/font/google";
import "../[locale]/globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export default function LanguageSelectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>ΑΠΑΛΛΑΚΤΗΣ - Select Language</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body className={notoSans.variable}>
        <div className="mobile-preview-wrapper">{children}</div>
      </body>
    </html>
  );
}
