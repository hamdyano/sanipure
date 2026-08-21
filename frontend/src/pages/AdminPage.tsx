import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RevealSection from "../components/shared/RevealSection";
import { signIn, signUp } from "../api/clientApi";
import {
  showErrorToast,
  showSuccessToast,
  showUnexpectedErrorToast,
} from "../lib/toast";

type Mode = "signin" | "signup";

const inputClasses =
  "w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white";

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
  const [mode, setMode] = useState<Mode>("signin");
  const [submitting, setSubmitting] = useState(false);

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const switchMode = (next: Mode) => {
    setMode(next);
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
      showSuccessToast("Signed in successfully");
      navigate("/");
    } catch (err) {
      reportError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();

    const { username, email, password, confirmPassword } = signUpData;
    if (!username || !email || !password || !confirmPassword) {
      showErrorToast("Fill in every field.");
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
      await signUp({ username, email, password });
      showSuccessToast("Account created successfully");
      navigate("/");
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
                mode === "signin" ? "bg-white text-black" : "text-white/60"
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
                <input
                  type="password"
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={inputClasses}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing In…" : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Username
                </label>
                <input
                  type="text"
                  value={signUpData.username}
                  onChange={(e) =>
                    setSignUpData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className={inputClasses}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Email
                </label>
                <input
                  type="email"
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData((prev) => ({
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
                <input
                  type="password"
                  value={signUpData.password}
                  onChange={(e) =>
                    setSignUpData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={inputClasses}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signUpData.confirmPassword}
                  onChange={(e) =>
                    setSignUpData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className={inputClasses}
                  placeholder="••••••••"
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
