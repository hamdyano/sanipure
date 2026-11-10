import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import RevealSection from "../components/shared/RevealSection";
import {
  isValidEmail,
  isValidPhone,
  resetPassword,
  signIn,
  signUp,
} from "../api/clientApi";
import {
  showErrorToast,
  showSuccessToast,
  showUnexpectedErrorToast,
} from "../lib/toast";
import { readWishlistIntent } from "../lib/authPrompt";
import { ensureInWishlist } from "../lib/wishlist";

type Mode = "signin" | "signup" | "reset";

// Every sign-up field is required. Labels are used in the "Please fill in…"
// message, in form order.
const SIGN_UP_FIELDS = [
  { key: "username", label: "your username" },
  { key: "email", label: "your email" },
  { key: "phone", label: "your phone number" },
  { key: "password", label: "a password" },
  { key: "confirmPassword", label: "the password confirmation" },
] as const;
type SignUpField = (typeof SIGN_UP_FIELDS)[number]["key"];

const inputClasses =
  "w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white";

// Red border for a required field left empty (shown after a submit attempt).
const invalidInputClasses = "border-red-400/80 focus:border-red-300";

const withInvalid = (classes: string, invalid?: boolean) =>
  invalid ? `${classes} ${invalidInputClasses}` : classes;

/** Sign-up field label with a required marker. */
const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: string }) => (
  <label htmlFor={htmlFor} className="mb-1 block text-sm text-white/70">
    {children}
    <span aria-hidden="true" className="ml-0.5 text-red-400">
      *
    </span>
  </label>
);

// A password input with an eye button that shows/hides what's typed. Each
// field keeps its own visibility, so revealing one doesn't reveal the others.
const PasswordInput = ({
  value,
  onChange,
  autoComplete,
  id,
  required,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  id?: string;
  required?: boolean;
  invalid?: boolean;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        className={withInvalid(`${inputClasses} pr-12`, invalid)}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/50 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {visible && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </div>
  );
};

// If the backend responded with an error (400/401/409/etc.), it always
// includes a specific { message }. If no response came back at all (network
// down, backend unreachable, timeout), there's nothing specific to show.
const getServerErrorMessage = (err: unknown): string | null => {
  if (
    axios.isAxiosError(err) &&
    err.response &&
    typeof err.response.data?.message === "string"
  ) {
    return err.response.data.message;
  }
  return null;
};

const reportError = (err: unknown) => {
  const serverMessage = getServerErrorMessage(err);
  if (serverMessage) {
    showErrorToast(serverMessage);
  } else {
    showUnexpectedErrorToast();
  }
};

const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Where to go after signing in: back to the page that sent the visitor here
  // (e.g. a heart button on a product), else the home page. Only same-site
  // paths are accepted.
  const from = (location.state as { from?: unknown } | null)?.from;
  const returnTo =
    typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/";
  // A product whose wishlist heart a signed-out visitor clicked; it's added to
  // their wishlist as soon as they sign in or up.
  const wishlistProduct = readWishlistIntent(
    (location.state as { wishlistProduct?: unknown } | null)?.wishlistProduct,
  );

  // Sign-in/up has already succeeded at this point, so a failure here only warns —
  // the visitor still goes back to the product and can click the heart again.
  const finishAuth = async (successMessage: string) => {
    if (wishlistProduct) {
      try {
        await ensureInWishlist(wishlistProduct.id);
        showSuccessToast(`${successMessage}. ${wishlistProduct.name} was added to your wishlist.`);
      } catch {
        showSuccessToast(successMessage);
        showErrorToast(`We couldn't add ${wishlistProduct.name} to your wishlist. Please try again.`);
      }
    } else {
      showSuccessToast(successMessage);
    }
    navigate(returnTo);
  };

  // The sign-in pop-up (AuthPromptModal) says which tab to open on.
  const requestedMode = (location.state as { mode?: unknown } | null)?.mode;
  const initialMode: Mode = requestedMode === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  // If the pop-up is used while already on this page, switch to its tab.
  const [lastLocationKey, setLastLocationKey] = useState(location.key);
  if (lastLocationKey !== location.key) {
    setLastLocationKey(location.key);
    setMode(initialMode);
  }
  const [submitting, setSubmitting] = useState(false);

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  // Set after a sign-up attempt with empty fields, so those fields turn red.
  const [showSignUpErrors, setShowSignUpErrors] = useState(false);
  const isSignUpFieldEmpty = (key: SignUpField) =>
    showSignUpErrors && !signUpData[key].trim();

  const [resetData, setResetData] = useState({
    email: "",
    resetWord: "",
    newPassword: "",
    confirmPassword: "",
  });

  const switchMode = (next: Mode) => {
    setMode(next);
  };

  // Switches to the Sign Up tab, carrying over an email already typed on the
  // sign-in form (unless one was already entered on the sign-up form).
  const openSignUp = () => {
    setSignUpData((prev) => ({ ...prev, email: prev.email || signInData.email }));
    setMode("signup");
  };

  // Carries over whatever email was already typed on the sign-in form.
  const openReset = () => {
    setResetData({
      email: signInData.email,
      resetWord: "",
      newPassword: "",
      confirmPassword: "",
    });
    setMode("reset");
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();

    const { email, resetWord, newPassword, confirmPassword } = resetData;
    if (!email || !resetWord || !newPassword || !confirmPassword) {
      showErrorToast("Fill in every field.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      showErrorToast("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ email, resetWord, newPassword });
      showSuccessToast("Password reset. Sign in with your new password.");
      setSignInData({ email, password: "" });
      setMode("signin");
    } catch (err) {
      reportError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();

    if (!signInData.email || !signInData.password) {
      showErrorToast("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await signIn(signInData);
      await finishAuth("Signed in successfully");
    } catch (err) {
      reportError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();

    const { password, confirmPassword } = signUpData;
    const username = signUpData.username.trim();
    const email = signUpData.email.trim();
    const phone = signUpData.phone.trim();

    const missing = SIGN_UP_FIELDS.filter(({ key }) => !signUpData[key].trim());
    if (missing.length) {
      setShowSignUpErrors(true);
      showErrorToast(
        missing.length === 1
          ? `Please fill in ${missing[0].label}.`
          : `Please fill in every field: ${missing.map((f) => f.label).join(", ")}.`,
      );
      return;
    }
    if (!isValidEmail(email)) {
      showErrorToast("Enter a valid email address.");
      return;
    }
    if (!isValidPhone(phone)) {
      showErrorToast("Enter a valid phone number.");
      return;
    }
    if (password !== confirmPassword) {
      showErrorToast("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      showErrorToast("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp({ username, email, phone, password });
      await finishAuth("Account created successfully");
    } catch (err) {
      reportError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">Admin</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Sign in to manage Sanipure, or create a new account.
        </p>
      </RevealSection>

      <section className="mx-auto my-16 max-w-md px-6 md:my-20">
        <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-8">
          <div className="mb-8 flex rounded-full border border-white/20 p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 rounded-full py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                mode !== "signup" ? "bg-white text-black" : "text-white/60"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-full py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                mode === "signup" ? "bg-white text-black" : "text-white/60"
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Email
                </label>
                <input
                  type="email"
                  value={signInData.email}
                  onChange={(e) =>
                    setSignInData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={inputClasses}
                  placeholder="you@sanipure-eg.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Password
                </label>
                <PasswordInput
                  value={signInData.password}
                  onChange={(password) =>
                    setSignInData((prev) => ({ ...prev, password }))
                  }
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={openReset}
                  className="mt-2 text-sm text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  Forgot password?
                </button>
                <p className="mt-1 text-sm text-white/60">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={openSignUp}
                    className="font-medium text-white underline underline-offset-4 transition-colors hover:text-white/80"
                  >
                    Sign up
                  </button>
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing In…" : "Sign In"}
              </button>
            </form>
          ) : mode === "reset" ? (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-medium text-white">Reset Password</h2>
                <p className="mt-1 text-sm text-white/60">
                  Enter your email, the reset word, and a new password.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Email
                </label>
                <input
                  type="email"
                  value={resetData.email}
                  onChange={(e) =>
                    setResetData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={inputClasses}
                  placeholder="you@sanipure-eg.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Reset Word
                </label>
                {/* Phones would otherwise capitalize the first letter, and
                    the word is checked in lowercase. */}
                <input
                  type="text"
                  value={resetData.resetWord}
                  onChange={(e) =>
                    setResetData((prev) => ({
                      ...prev,
                      resetWord: e.target.value,
                    }))
                  }
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className={inputClasses}
                  placeholder="Lowercase letters only"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  New Password
                </label>
                <PasswordInput
                  value={resetData.newPassword}
                  onChange={(newPassword) =>
                    setResetData((prev) => ({ ...prev, newPassword }))
                  }
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Confirm New Password
                </label>
                <PasswordInput
                  value={resetData.confirmPassword}
                  onChange={(confirmPassword) =>
                    setResetData((prev) => ({ ...prev, confirmPassword }))
                  }
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Resetting…" : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            // noValidate: our own checks below show one consistent message
            // instead of the browser's built-in popups.
            <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-4">
              <p className="text-xs text-white/50">
                All fields are required<span aria-hidden="true" className="text-red-400"> *</span>
              </p>
              <div>
                <RequiredLabel htmlFor="signup-username">Username</RequiredLabel>
                <input
                  id="signup-username"
                  type="text"
                  autoComplete="username"
                  aria-required="true"
                  aria-invalid={isSignUpFieldEmpty("username") || undefined}
                  maxLength={50}
                  value={signUpData.username}
                  onChange={(e) =>
                    setSignUpData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className={withInvalid(inputClasses, isSignUpFieldEmpty("username"))}
                  placeholder="Your name"
                />
              </div>
              <div>
                <RequiredLabel htmlFor="signup-email">Email</RequiredLabel>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={isSignUpFieldEmpty("email") || undefined}
                  maxLength={254}
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={withInvalid(inputClasses, isSignUpFieldEmpty("email"))}
                  placeholder="you@sanipure-eg.com"
                />
              </div>
              <div>
                <RequiredLabel htmlFor="signup-phone">Phone Number</RequiredLabel>
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  aria-required="true"
                  aria-invalid={isSignUpFieldEmpty("phone") || undefined}
                  maxLength={30}
                  value={signUpData.phone}
                  onChange={(e) =>
                    setSignUpData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className={withInvalid(inputClasses, isSignUpFieldEmpty("phone"))}
                  placeholder="+20 100 000 0000"
                />
              </div>
              <div>
                <RequiredLabel htmlFor="signup-password">Password</RequiredLabel>
                <PasswordInput
                  id="signup-password"
                  required
                  invalid={isSignUpFieldEmpty("password")}
                  value={signUpData.password}
                  onChange={(password) =>
                    setSignUpData((prev) => ({ ...prev, password }))
                  }
                  autoComplete="new-password"
                />
              </div>
              <div>
                <RequiredLabel htmlFor="signup-confirm-password">Confirm Password</RequiredLabel>
                <PasswordInput
                  id="signup-confirm-password"
                  required
                  invalid={isSignUpFieldEmpty("confirmPassword")}
                  value={signUpData.confirmPassword}
                  onChange={(confirmPassword) =>
                    setSignUpData((prev) => ({ ...prev, confirmPassword }))
                  }
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing Up…" : "Sign Up"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminPage;
