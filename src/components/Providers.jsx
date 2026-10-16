"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
  minimum: 0.15,
  easing: "ease",
  speed: 800,
  trickleSpeed: 100,
});

export default function Providers({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigationInProgress = useRef(false);

  // Smooth start on navigation
  useEffect(() => {
    if (navigationInProgress.current) return;

    navigationInProgress.current = true;
    NProgress.start();

    return () => {};
  }, [pathname, searchParams]);

  // Stop after new content is rendered
  useEffect(() => {
    if (!navigationInProgress.current) return;

    NProgress.done();
    navigationInProgress.current = false;
  }, [pathname, searchParams]);

  return <>{children}</>;
}
