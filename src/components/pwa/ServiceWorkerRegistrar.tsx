"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production only.
 * In development the worker is skipped so hot reloads are never served from a
 * stale cache.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // A worker registered earlier by a production preview (`next start`) keeps
    // serving hashed chunks from its cache while `next dev` rebuilds them,
    // which shows up as hydration mismatches in the browser. Drop it in dev.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .catch(() => {
          // Nothing to clean up.
        });

      if (typeof caches !== "undefined") {
        void caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => {
            // Cache storage may be blocked; the page still works.
          });
      }

      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Registration failures are non-fatal; the app still works online.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
