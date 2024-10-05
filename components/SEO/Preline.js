"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PrelineScript() {
    const path = usePathname();
    useEffect(() => {
        const loadPreline = async () => {
            await import("preline/preline");
            window.HSStaticMethods.autoInit();
        };

        loadPreline();
    }, [path]);

    return null;
}