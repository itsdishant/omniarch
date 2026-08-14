"use client";

import { useEffect, useState } from "react";

const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";

export function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_VIEWPORT_QUERY);

    function sync() {
      setIsMobile(media.matches);
    }

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
