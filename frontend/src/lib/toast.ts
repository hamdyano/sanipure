import toast from "react-hot-toast";

// Shared toast helpers so any save/update/delete action anywhere in the app
// (not just auth) can trigger the same consistent success/error feedback —
// just call showSuccessToast(...) / showErrorToast(...) from wherever.

const baseStyle = {
  borderRadius: "9999px",
  padding: "12px 20px",
  fontSize: "14px",
  fontWeight: 500,
};

export const showSuccessToast = (message: string) =>
  toast.success(message, {
    duration: 4000,
    style: {
      ...baseStyle,
      background: "#052e1f",
      color: "#bbf7d0",
      border: "1px solid rgba(34, 197, 94, 0.4)",
    },
    iconTheme: {
      primary: "#22c55e",
      secondary: "#052e1f",
    },
  });

export const showErrorToast = (message: string) =>
  toast.error(message, {
    duration: 5000,
    style: {
      ...baseStyle,
      background: "#2c0b0e",
      color: "#fecaca",
      border: "1px solid rgba(239, 68, 68, 0.4)",
    },
    iconTheme: {
      primary: "#ef4444",
      secondary: "#2c0b0e",
    },
  });

// Generic fallback for anything unexpected (network errors, backend
// unreachable, etc.) where there's no specific server message to show.
export const showUnexpectedErrorToast = () =>
  showErrorToast("Something went wrong. Please try again.");
