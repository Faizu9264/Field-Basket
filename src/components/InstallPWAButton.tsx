"use client";
import React, { useEffect, useState } from "react";

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  // @ts-expect-error iOS Safari only: 'standalone' is not in standard types
  return window.navigator.standalone === true;
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    // Android/Chrome: show install button
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show banner if not installed
    if (isIos() && !isInStandaloneMode()) {
      setShowIosBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowButton(false);
      setDeferredPrompt(null);
    }
  };

  if (showIosBanner) {
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border-2 border-green-600 text-green-900 rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 max-w-sm w-[95vw] animate-fade-in">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#16a34a" d="M12 2a1 1 0 0 1 1 1v11.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L11 14.586V3a1 1 0 0 1 1-1Z"/></svg>
        </div>
        <div className="flex-1 text-sm leading-snug">
          <span className="font-bold">Install this app</span><br />
          <span className="text-gray-700">Tap <span className="inline-block px-1 py-0.5 bg-gray-200 rounded font-semibold">Share</span> then <span className="inline-block px-1 py-0.5 bg-gray-200 rounded font-semibold">Add to Home Screen</span></span>
        </div>
        <button className="ml-2 text-gray-400 hover:text-green-600 text-xl font-bold p-1 rounded-full transition" onClick={() => setShowIosBanner(false)} aria-label="Close banner">&times;</button>
      </div>
    );
  }

  if (!showButton) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg font-bold hover:bg-green-700 transition"
    >
      Install App
    </button>
  );
}
