"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#111",
          color: "#fff",
          border: "3px solid rgba(255,255,255,0.3)",
          borderRadius: "0px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontSize: "12px",
          boxShadow: "6px 6px 0 rgba(255,255,255,0.15)",
        },
      }}
      richColors
    />
  );
}
