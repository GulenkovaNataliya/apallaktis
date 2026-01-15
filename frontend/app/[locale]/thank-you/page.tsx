"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import VideoBackground from "@/components/VideoBackground";
import { messages, type Locale } from "@/lib/messages";

export default function ThankYouPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.thankYou || messages.el.thankYou;

  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/${locale}/login`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [locale, router]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fullscreen video background - same as page_01 */}
      <VideoBackground videoSrc="/video/video1.mp4" />

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
        {/* Main content - centered */}
        <div className="flex w-full max-w-sm flex-col items-center text-center gap-6">
          {/* Thank you text - directly on video */}
          <div className="text-button font-semibold" style={{ color: "#ff8f0a" }}>
            {t.title}
          </div>

          {/* Slogan 2 - with slogan color */}
          <div className="text-slogan font-semibold" style={{ color: "#ff8f0a" }}>
            {t.slogan2}
          </div>

          {/* Redirect message with countdown */}
          <div className="text-body" style={{ color: "#ff8f0a" }}>
            {t.redirectMessage.replace('{seconds}', seconds.toString())}
          </div>

          {/* Login now button */}
          <div className="btn-single-wrapper">
            <Link
              href={`/${locale}/login`}
              className="btn-primary text-button btn-single text-center"
              style={{
                backgroundColor: "var(--polar)",
                color: "var(--deep-teal)",
                boxShadow: "0 4px 8px var(--deep-teal)",
              }}
            >
              {t.loginButton}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
