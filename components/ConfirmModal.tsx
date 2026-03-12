"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: "danger" | "primary";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    confirmVariant = "primary"
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg
              ${confirmVariant === "danger"
                                ? "bg-red-500 shadow-red-500/20 hover:bg-red-600"
                                : "bg-brand-teal shadow-brand-teal/20 hover:opacity-90"}
            `}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
