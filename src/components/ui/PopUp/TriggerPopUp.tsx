"use client";

import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TriggerPopupProps {
  trigger: ReactNode;
  children: ReactNode;
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  closeOnClickOutside?: boolean;
}

const TriggerPopUp: React.FC<TriggerPopupProps> = ({
  trigger,
  children,
  position = "bottom-right",
  closeOnClickOutside = true,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  // Close on clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (
        closeOnClickOutside &&
        popupRef.current &&
        triggerRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, closeOnClickOutside]);

  // Positioning styles
  const positionClasses: Record<string, string> = {
    "bottom-right": "top-full left-0",
    "bottom-left": "top-full right-0",
    "top-right": "bottom-full left-0",
    "top-left": "bottom-full right-0",
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className="">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TriggerPopUp;
