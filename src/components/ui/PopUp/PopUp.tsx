"use client";

import { X } from "lucide-react";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface PopupProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

const PopUp: React.FC<PopupProps> = ({
    open,
    onClose,
    children,
}) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // Only run in browser
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (

                popupRef.current &&
                !popupRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        if (open) {
            document.body.style.overflow = "hidden";
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEsc);
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [open, mounted, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence mode="wait">
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        ref={popupRef}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-auto max-w-[95vw] min-w-[300px] rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-dark-700"
                    >
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        >
                            <X size={28} />
                        </button>
                        <div className="p-4">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default PopUp;
