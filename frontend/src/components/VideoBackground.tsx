"use client";

import { useEffect, useRef, useState } from "react";

interface VideoBackgroundProps {
  videoSrc: string;
  posterSrc?: string;
}

export default function VideoBackground({
  videoSrc,
  posterSrc,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      video.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    };

    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        className={`absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
        preload="metadata"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
