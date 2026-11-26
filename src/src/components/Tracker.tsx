"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Sends one tiny, non-blocking request per page view to /api/track. */
export default function Tracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || lastPath.current === pathname) return;

    const isFirstView = lastPath.current === null;
    lastPath.current = pathname;

    const params = new URLSearchParams(window.location.search);
    const payload = JSON.stringify({
      path: pathname,
      // only the first page of a visit has an external referrer
      ref: isFirstView ? document.referrer : "",
      utm: isFirstView ? params.get("utm_source") || params.get("ref") || "" : "",
    });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", payload);
      } else {
        fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
      }
    } catch {
      /* never break the page because of analytics */
    }
  }, [pathname]);

  return null;
}
