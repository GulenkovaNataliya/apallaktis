"use client";

import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  videoSrc: string;
  posterSrc?: string;
}

export default function VideoBackground({
  videoSrc,
  posterSrc,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt to play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.warn("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
