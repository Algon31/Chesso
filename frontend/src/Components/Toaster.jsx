// src/components/Toaster.jsx
import { Toaster as SonnerToaster } from "sonner";

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      expand
      toastOptions={{
        duration: 3000,
        style: {
          background: "#222",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
        },
      }}
    />
  );
}
