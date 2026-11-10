import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  OPEN_AUTH_PROMPT_EVENT,
  type AccountType,
  type AuthPromptOptions,
  type AuthPromptTab,
  type WishlistIntent,
} from "../lib/authPrompt";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

// Edit these to change what the pop-up promises members.
const MEMBER_BENEFITS = [
  "Save favourite products to your wishlist",
  "Plan your bathroom project in one place",
  "Be first to hear about new collections and offers",
  "Faster inquiries with your details saved",
  "Manage your profile anytime",
];

const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  description: string;
  /** Shown as normal but can't be chosen yet. */
  unavailable?: boolean;
}[] = [
  {
    value: "homeowner",
    label: "Homeowner Account",
    description: "For individual customers planning and purchasing for their home.",
  },
  {
    value: "professional",
    label: "Sanipure Pro Account",
    description:
      "For architects, contractors and designers managing projects and business needs.",
    // Not built yet — set to false (or remove) once the Pro account exists.
    unavailable: true,
  },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The pop-up visitors see before going to the Sign In / Sign Up page.
 * Opened with openAuthPrompt() from lib/authPrompt.
 */
const AuthPromptModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AuthPromptTab>("signin");
  const [accountType, setAccountType] = useState<AccountType>("homeowner");
  const [from, setFrom] = useState("/");
  const [wishlistProduct, setWishlistProduct] = useState<WishlistIntent | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Closes if the page changes underneath (e.g. browser Back).
  const [lastLocationKey, setLastLocationKey] = useState(location.key);
  if (lastLocationKey !== location.key) {
    setLastLocationKey(location.key);
    setOpen(false);
  }

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const options = (event as CustomEvent<AuthPromptOptions>).detail ?? {};
      const current = `${window.location.pathname}${window.location.search}`;
      openerRef.current = document.activeElement as HTMLElement | null;
      setTab(options.tab ?? "signin");
      setAccountType("homeowner");
      // Coming back to the sign-in page itself after signing in makes no sense.
      setFrom(options.from ?? (current.startsWith("/admin") ? "/" : current));
      setWishlistProduct(options.wishlistProduct ?? null);
      setOpen(true);
    };
    window.addEventListener(OPEN_AUTH_PROMPT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_AUTH_PROMPT_EVENT, handleOpen);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // While open: lock page scroll, focus the dialog, close on Escape, and keep
  // Tab inside the dialog. On close, focus goes back to whatever opened it.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus?.();
    };
  }, [open, close]);

  const goTo = (mode: AuthPromptTab) => {
    setOpen(false);
    navigate("/admin", {
      state: {
        mode,
        from,
        ...(mode === "signup" ? { accountType } : {}),
        ...(wishlistProduct ? { wishlistProduct } : {}),
      },
    });
  };

  const fade = prefersReducedMotion ? { duration: 0 } : { duration: 0.2 };

  const tabClasses = (active: boolean) =>
    `-mb-px border-b-[3px] px-5 pb-3 pt-1 text-lg transition-colors ${
      active
        ? "border-neutral-800 text-neutral-900"
        : "border-transparent text-neutral-500 hover:text-neutral-800"
    }`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          onMouseDown={(event) => {
            // Only a click on the dark backdrop itself closes the pop-up.
            if (event.target === event.currentTarget) close();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[90vh] w-full max-w-[860px] overflow-y-auto bg-white text-neutral-800 shadow-2xl"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={fade}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 p-2 text-neutral-600 transition-colors hover:text-neutral-900 md:right-6 md:top-6"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M5 5l14 14M19 5 5 19" />
              </svg>
            </button>

            <div
              role="tablist"
              aria-label="Account"
              className="flex justify-center gap-2 border-b border-neutral-300 pt-14 md:pt-16"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signin"}
                onClick={() => setTab("signin")}
                className={tabClasses(tab === "signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signup"}
                onClick={() => setTab("signup")}
                className={tabClasses(tab === "signup")}
              >
                Create Account
              </button>
            </div>

            <div className="grid gap-10 px-6 py-10 md:grid-cols-[1.2fr_1fr] md:gap-14 md:px-10 md:py-12">
              <div>
                <h2
                  id={titleId}
                  className="font-brand text-xl font-semibold uppercase tracking-[0.12em] text-neutral-800 md:text-2xl"
                >
                  {tab === "signin" ? "Welcome Back" : "Create Your Account"}
                </h2>
                {wishlistProduct && (
                  <p className="mt-4 font-medium text-neutral-900">
                    {tab === "signin" ? "Sign in" : "Create an account"} to save{" "}
                    {wishlistProduct.name} to your wishlist — we'll bring you right back to
                    it.
                  </p>
                )}
                <p className="mt-4 text-neutral-600">
                  {tab === "signin"
                    ? "Sign in to pick up where you left off and enjoy your member benefits:"
                    : "Take advantage of these benefits, exclusively available for Sanipure Account Members:"}
                </p>
                <ul className="mt-4 space-y-3 text-neutral-600">
                  {MEMBER_BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[0.6em] h-1.5 w-1.5 shrink-0 bg-neutral-500"
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {tab === "signin" ? (
                <div className="flex flex-col justify-center gap-5">
                  <p className="text-sm text-neutral-600">
                    Already have a Sanipure account? Sign in with your email and password.
                  </p>
                  <button
                    type="button"
                    onClick={() => goTo("signin")}
                    className="w-full border border-neutral-800 bg-neutral-900 px-6 py-3 text-lg text-white transition-colors hover:bg-neutral-700"
                  >
                    Sign In
                  </button>
                  <p className="text-sm text-neutral-600">
                    New to Sanipure?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("signup")}
                      className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
                    >
                      Create an account
                    </button>
                  </p>
                </div>
              ) : (
                <fieldset className="flex flex-col gap-7">
                  <legend className="sr-only">Account type</legend>
                  {ACCOUNT_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`block ${type.unavailable ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="flex items-center gap-3 text-lg text-neutral-900">
                        {/* Unavailable types use aria-disabled rather than the
                            disabled attribute, which would grey the radio out —
                            they keep the normal look but can't be selected. */}
                        <input
                          type="radio"
                          name="account-type"
                          value={type.value}
                          checked={accountType === type.value}
                          aria-disabled={type.unavailable || undefined}
                          tabIndex={type.unavailable ? -1 : undefined}
                          onChange={() => {
                            if (!type.unavailable) setAccountType(type.value);
                          }}
                          className={`h-5 w-5 accent-neutral-900 ${
                            type.unavailable ? "pointer-events-none" : "cursor-pointer"
                          }`}
                        />
                        {type.label}
                      </span>
                      <span className="mt-3 block text-sm leading-relaxed text-neutral-500">
                        {type.description}
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => goTo("signup")}
                    className="w-full border border-neutral-800 px-6 py-3 text-lg text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
                  >
                    Create Account
                  </button>
                </fieldset>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;
