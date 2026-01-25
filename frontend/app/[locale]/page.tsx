"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import VideoBackground from "@/components/VideoBackground";
import { messages, type Locale } from "@/lib/messages";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function LandingPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.landing || messages.el.landing;

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fullscreen video background */}
      <VideoBackground videoSrc="/video/video1.mp4" posterSrc="/pages/page-01.webp" />

      {/* Content overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 safe-area-top safe-area-bottom" style={{ paddingTop: '180px', paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back button */}
          <Link
            href="/language-select"
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToLanguageSelection}
          </Link>
          <h1
            className="text-center text-slogan font-semibold"
            style={{ color: "#ff8f0a", width: "75%", margin: "0 auto" }}
          >
            {t.slogan}
          </h1>

          {/* Action buttons - 4 buttons with gradient from object color deck */}
          <div className="flex w-full flex-col gap-12 items-center">
            {/* Button 1: Login */}
            <Link
              href={`/${locale}/login`}
              className="btn-primary text-button text-center w-full"
              style={{
                minHeight: "52px",
                backgroundColor: "#e7f4f1",
                color: "#033a45",
                boxShadow: "0 4px 8px #033a45",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.login}
            </Link>

            {/* Button 2: Register */}
            <Link
              href={`/${locale}/register`}
              className="btn-primary text-button text-center w-full"
              style={{
                minHeight: "52px",
                backgroundColor: "#dbeee8",
                color: "#033a45",
                boxShadow: "0 4px 8px #033a45",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.register}
            </Link>

            {/* Button 3: View Pricing */}
            <Link
              href={`/${locale}/pricing`}
              className="btn-primary text-button text-center w-full"
              style={{
                minHeight: "52px",
                backgroundColor: "#cfe8e3",
                color: "#033a45",
                boxShadow: "0 4px 8px #033a45",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.viewPricing}
            </Link>

            {/* Button 4: How to Use */}
            <Link
              href={`/${locale}/help`}
              className="btn-primary text-button text-center w-full"
              style={{
                minHeight: "52px",
                backgroundColor: "#c3e2dc",
                color: "#033a45",
                boxShadow: "0 4px 8px #033a45",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.howToUse}
            </Link>

            {/* Button 5: Download App (PWA Install) */}
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="btn-primary text-button text-center w-full"
                style={{
                  minHeight: "52px",
                  backgroundColor: "#b7dcd5",
                  color: "#033a45",
                  boxShadow: "0 4px 8px #033a45",
                  borderRadius: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t.downloadApp}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
