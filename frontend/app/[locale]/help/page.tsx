"use client";

import { useParams, useRouter } from "next/navigation";
import VideoBackground from "@/components/VideoBackground";
import { messages, type Locale } from "@/lib/messages";

export default function HelpPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.help || messages.el.help;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fullscreen video background */}
      <VideoBackground videoSrc="/video/video1.mp4" posterSrc="/pages/page-01.webp" />

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 safe-area-top safe-area-bottom" style={{ paddingTop: '180px', paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back */}
          <p
            onClick={() => router.push(`/${locale}`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.back}
          </p>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {t.title}
          </h1>

          {/* Content - Placeholder */}
          <div
            className="rounded-2xl"
            style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}
          >
            <p className="text-center text-body" style={{ color: 'var(--deep-teal)' }}>
              {t.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
