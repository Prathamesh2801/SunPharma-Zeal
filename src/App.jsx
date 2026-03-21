import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./routes/MainRoute";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            background: "#FFFFFF",
            color: "var(--color-ink-primary)",
            border: "1px solid var(--color-surface-200)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-brand-500)",
              secondary: "#FFFFFF",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-error)",
              secondary: "#FFFFFF",
            },
          },
          duration: 3000,
        }}
      />
    </>
  );
}