"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sidebar } from "./Sidebar";
import type { MobileSidebarProps } from "../types";

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when open
    useEffect(() => {
        if (!mounted) return;
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open, mounted]);

    if (!mounted || !open) return null;

    return createPortal(
        <>
            {/* Backdrop — clicking here closes the sidebar */}
            <div
                className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Drawer */}
            <div className="fixed left-0 top-0 bottom-0 z-50 w-60 shadow-2xl">
                {<Sidebar isMobile />}
            </div>
        </>,
        document.body,
    );
}