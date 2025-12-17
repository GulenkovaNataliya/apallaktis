"use client";

import VideoBackground from "@/components/VideoBackground";
import LanguageSelector from "@/components/LanguageSelector";

export default function LanguageSelectPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fullscreen video background */}
      <VideoBackground videoSrc="/video/video.mp4" />

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
        <LanguageSelector />
      </div>
    </div>
  );
}
