"use client";

import { useParams } from "next/navigation";
import VideoBackground from "@/components/VideoBackground";
import { messages, type Locale } from "@/lib/messages";

export default function ThankYouPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.thankYou || messages.el.thankYou;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fullscreen video background - same as page_01 */}
      <VideoBackground videoSrc="/video/video1.mp4" />

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
        {/* Main content - centered */}
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          {/* Thank you text - directly on video */}
          <div className="text-button font-semibold" style={{ color: "#ff8f0a" }}>
            {t.title}
          </div>

          {/* Spacer - 20px */}
          <div style={{ height: "20px" }} />

          {/* Slogan 2 - with slogan color */}
          <div className="text-slogan font-semibold" style={{ color: "#ff8f0a" }}>
            {t.slogan2}
          </div>
        </div>
      </div>
    </div>
  );
}
