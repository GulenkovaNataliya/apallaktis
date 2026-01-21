"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import VideoBackground from "@/components/VideoBackground";
import { messages, type Locale } from "@/lib/messages";

export default function LandingPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.landing || messages.el.landing;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fullscreen video background */}
      <VideoBackground videoSrc="/video/video1.mp4" posterSrc="/pages/page-01.webp" />

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
        {/* Main content - centered vertically */}
        <div className="flex w-full max-w-sm flex-col items-center gap-12">
          <h1
            className="text-center text-slogan font-semibold"
            style={{ color: "#ff8f0a", width: "75%" }}
          >
            {t.slogan}
          </h1>

          {/* Action buttons */}
          <div className="flex w-full flex-col gap-12 items-center">
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
                {t.login}
              </Link>
            </div>
            <div className="btn-single-wrapper">
              <Link
                href={`/${locale}/register`}
                className="btn-primary text-button btn-single text-center"
                style={{
                  backgroundColor: "var(--polar)",
                  color: "var(--deep-teal)",
                  boxShadow: "0 4px 8px var(--deep-teal)",
                }}
              >
                {t.register}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
