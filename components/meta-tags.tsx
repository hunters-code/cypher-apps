"use client";

import { useEffect } from "react";

export function MetaTags() {
  useEffect(() => {
    const existingMeta = document.querySelector('meta[name="base:app_id"]');

    if (!existingMeta) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "base:app_id");
      meta.setAttribute("content", "6952106ac63ad876c90817b6");
      document.head.appendChild(meta);
    }
  }, []);

  return null;
}
