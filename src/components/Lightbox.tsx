"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxProps {
  images: { src: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({
  images,
  initialIndex,
  onClose,
}: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  /* Keyboard navigation */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, prev, next]);

  /* Body scroll lock */
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const current = images[index];

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Close lightbox"
        >
          &times;
        </button>

        {/* Image counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-1.5 rounded-full text-sm">
          {index + 1} / {images.length}
        </div>

        {/* Previous arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Previous image"
        >
          &#8249;
        </button>

        {/* Next arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Next image"
        >
          &#8250;
        </button>

        {/* Image */}
        <motion.div
          key={current.src}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={current.src}
            alt={current.alt}
            width={1200}
            height={900}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            priority
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
