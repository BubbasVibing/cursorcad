"use client";

/**
 * InputBar -- Chat input field with send button and image upload,
 * pinned to the bottom of ChatPanel.
 *
 * Theme: Light -- white/gray-50 background, gray-200 borders, violet-500 accents.
 *
 * Features:
 *   - Auto-expanding <textarea> (grows with content, max 5 rows)
 *   - Enter to send, Shift+Enter for newline
 *   - Camera icon button to attach an image (jpeg/png/webp, <5MB)
 *   - Client-side image resize to max 1024px before encoding
 *   - Thumbnail preview with remove button when image attached
 *   - Disabled state while generation is in progress
 *   - Violet-500 send button and focus ring
 */

import { useRef, useState, useCallback, type KeyboardEvent } from "react";

export interface ImageData {
  base64: string;
  mediaType: string;
  dataUrl: string;
}

interface InputBarProps {
  onSend?: (message: string, image?: ImageData) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Resize an image to fit within MAX_IMAGE_DIMENSION on its longest edge,
 * then re-encode as JPEG base64.
 */
function resizeImage(dataUrl: string): Promise<{ base64: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = resizedDataUrl.split(",")[1];
      resolve({ base64, dataUrl: resizedDataUrl });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export default function InputBar({ onSend, disabled = false }: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMediaType, setImageMediaType] = useState<string | null>(null);

  /* ---- Auto-resize the textarea to fit content ---- */
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; /* reset so scrollHeight recalculates */
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`; /* cap at ~5 rows */
  }, []);

  /* ---- Clear image state ---- */
  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageBase64(null);
    setImageMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  /* ---- Handle file selection ---- */
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("Please select a JPEG, PNG, or WebP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be under 5MB. Please choose a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      try {
        const { base64, dataUrl } = await resizeImage(rawDataUrl);
        setImagePreview(dataUrl);
        setImageBase64(base64);
        setImageMediaType("image/jpeg"); // always JPEG after resize
      } catch {
        alert("Failed to process image. Please try another file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      alert("Failed to read file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  }, []);

  /* ---- Send handler ---- */
  const send = useCallback(() => {
    const trimmed = value.trim();
    const hasImage = !!imageBase64;
    if ((!trimmed && !hasImage) || disabled) return;

    if (onSend) {
      const message = trimmed || "Analyze this image and create a 3D model";
      if (hasImage && imageBase64 && imageMediaType && imagePreview) {
        onSend(message, {
          base64: imageBase64,
          mediaType: imageMediaType,
          dataUrl: imagePreview,
        });
      } else {
        onSend(message);
      }
    }

    setValue("");
    clearImage();

    /* Reset height after clearing */
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = "auto";
    });
  }, [value, disabled, onSend, imageBase64, imageMediaType, imagePreview, clearImage]);

  /* ---- Keyboard shortcut: Enter to send, Shift+Enter for newline ---- */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isEmpty = value.trim().length === 0 && !imageBase64;

  return (
    <div className="border-t border-gray-200/60 p-3">
      {/* Image preview thumbnail */}
      {imagePreview && (
        <div className="mb-2 flex items-start gap-2 px-1">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Attached"
              className="h-16 w-16 rounded-lg object-cover border border-gray-200"
            />
            <button
              onClick={clearImage}
              aria-label="Remove image"
              className="
                absolute -top-1.5 -right-1.5 flex h-5 w-5
                items-center justify-center rounded-full
                bg-gray-600 text-white text-xs
                hover:bg-gray-500 transition-colors
              "
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div
        className="
          flex items-end gap-2 rounded-xl border border-gray-200
          bg-gray-50 px-3 py-2
          transition-colors duration-150
          focus-within:border-violet-500
        "
      >
        {/* Textarea input -- light bg, dark text */}
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          placeholder="Describe a part..."
          rows={1}
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          className="
            max-h-[160px] min-h-[24px] flex-1 resize-none
            bg-transparent text-sm text-gray-800
            placeholder:text-gray-400
            focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-50
          "
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Camera icon button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach image"
          className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-lg transition-all duration-150
            text-gray-400 hover:text-violet-500
            disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
            />
          </svg>
        </button>

        {/* Send button: violet-500 accent */}
        <button
          onClick={send}
          disabled={disabled || isEmpty}
          aria-label="Send message"
          className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-lg transition-all duration-150
            bg-violet-500 text-white
            hover:bg-violet-400
            disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
            active:scale-95
          "
        >
          {/* Arrow-up send icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 01.55.24l4 4.5a.75.75 0 11-1.1 1.02L10.75 5.66V16a.75.75 0 01-1.5 0V5.66L6.55 8.76a.75.75 0 11-1.1-1.02l4-4.5A.75.75 0 0110 3z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
