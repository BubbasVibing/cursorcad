"use client";

import { useRef, useEffect, useCallback } from "react";
import { resizeImage } from "@/lib/image-utils";
import type { ImageData } from "./InputBar";

interface CameraModalProps {
  open: boolean;
  onCapture: (imageData: ImageData) => void;
  onClose: () => void;
}

export default function CameraModal({ open, onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        // Permission denied or no camera — close silently
        if (!cancelled) onClose();
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, onClose, stopStream]);

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    try {
      const { base64, dataUrl } = await resizeImage(rawDataUrl);
      stopStream();
      onCapture({ base64, mediaType: "image/jpeg", dataUrl });
    } catch {
      stopStream();
      onClose();
    }
  }, [onCapture, onClose, stopStream]);

  const handleClose = useCallback(() => {
    stopStream();
    onClose();
  }, [onClose, stopStream]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Close camera"
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video viewfinder */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="max-h-[70vh] max-w-[90vw] rounded-lg object-cover"
      />

      {/* Capture button */}
      <div className="mt-8 pb-8">
        <button
          onClick={handleCapture}
          aria-label="Capture photo"
          className="
            flex h-16 w-16 items-center justify-center
            rounded-full bg-white border-4 border-gray-300
            shadow-lg transition-transform active:scale-95
            hover:border-gray-400
          "
        >
          <div className="h-12 w-12 rounded-full bg-white border-2 border-gray-200" />
        </button>
      </div>
    </div>
  );
}
