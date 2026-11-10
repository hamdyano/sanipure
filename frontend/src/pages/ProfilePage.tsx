import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RevealSection from "../components/shared/RevealSection";
import WishlistSection from "../components/profile/WishlistSection";
import {
  getProfile,
  isAuthenticated,
  isValidPhone,
  signOut,
  updateProfile,
  uploadProductImage,
  type Profile,
  type ProfileInput,
} from "../api/clientApi";
import {
  showErrorToast,
  showSuccessToast,
  showUnexpectedErrorToast,
} from "../lib/toast";

const inputClasses =
  "w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white";

const primaryButton =
  "rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "rounded-full border border-white/30 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-60";

const BIO_MAX = 500;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

// The optional details that count towards "profile complete".
const COMPLETION_FIELDS: { key: keyof Profile; label: string }[] = [
  { key: "avatarUrl", label: "photo" },
  { key: "fullName", label: "full name" },
  { key: "phone", label: "phone" },
  { key: "jobTitle", label: "job title" },
  { key: "location", label: "location" },
  { key: "bio", label: "bio" },
];

const toFormValues = (profile: Profile): ProfileInput => ({
  username: profile.username,
  fullName: profile.fullName ?? "",
  phone: profile.phone ?? "",
  jobTitle: profile.jobTitle ?? "",
  location: profile.location ?? "",
  bio: profile.bio ?? "",
  avatarUrl: profile.avatarUrl ?? "",
});

const getServerErrorMessage = (err: unknown): string | null =>
  axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
    ? err.response.data.message
    : null;

const reportError = (err: unknown) => {
  const message = getServerErrorMessage(err);
  if (message) showErrorToast(message);
  else showUnexpectedErrorToast();
};

// The session is no longer valid (token expired, or the account is gone).
const isSessionError = (err: unknown) =>
  axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 404);

const initialsOf = (profile: Pick<Profile, "fullName" | "username">) =>
  (profile.fullName || profile.username)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

const Avatar = ({
  url,
  initials,
  size,
}: {
  url: string | null;
  initials: string;
  size: "md" | "lg";
}) => {
  const sizeClasses = size === "lg" ? "h-28 w-28 text-3xl" : "h-20 w-20 text-xl";
  return url ? (
    <img
      src={url}
      alt=""
      className={`${sizeClasses} shrink-0 rounded-full border border-white/10 object-cover`}
    />
  ) : (
    <div
      aria-hidden="true"
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 font-semibold text-white`}
    >
      {initials}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="grid gap-1 border-b border-white/10 py-4 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
    <dt className="text-sm text-white/50">{label}</dt>
    <dd className="break-words text-sm text-white">
      {value || <span className="text-white/35">Not added yet</span>}
    </dd>
  </div>
);

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="mb-1 flex items-baseline justify-between gap-4 text-sm text-white/70">
      {label}
      {hint && <span className="text-xs text-white/40">{hint}</span>}
    </span>
    {children}
  </label>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const endSession = useCallback(
    (err: unknown) => {
      signOut();
      showErrorToast(getServerErrorMessage(err) ?? "Please sign in again.");
      navigate("/admin", { replace: true });
    },
    [navigate],
  );

  const fetchProfile = useCallback(
    () =>
      getProfile().then(setProfile, (err: unknown) => {
        if (isSessionError(err)) endSession(err);
        else setLoadFailed(true);
      }),
    [endSession],
  );

  const load = () => {
    setLoadFailed(false);
    fetchProfile();
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin", { replace: true });
      return;
    }
    fetchProfile();
  }, [navigate, fetchProfile]);

  const startEditing = () => {
    if (!profile) return;
    setForm(toFormValues(profile));
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setForm(null);
  };

  const setField = (key: keyof ProfileInput, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // so picking the same file again still fires
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      showErrorToast("Please choose a JPG, PNG, WEBP, GIF or AVIF image.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      showErrorToast("That photo is too large. Please choose one under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      setField("avatarUrl", await uploadProductImage(file));
    } catch (err) {
      reportError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;

    if (!form.username.trim()) {
      showErrorToast("Username is required.");
      return;
    }
    if (!form.phone.trim()) {
      showErrorToast("Phone number is required.");
      return;
    }
    if (!isValidPhone(form.phone)) {
      showErrorToast("Enter a valid phone number.");
      return;
    }

    setSaving(true);
    try {
      setProfile(await updateProfile(form));
      setEditing(false);
      setForm(null);
      showSuccessToast("Profile saved");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) endSession(err);
      else reportError(err);
    } finally {
      setSaving(false);
    }
  };

  const missing = profile ? COMPLETION_FIELDS.filter(({ key }) => !profile[key]) : [];
  const completion = Math.round(
    ((COMPLETION_FIELDS.length - missing.length) / COMPLETION_FIELDS.length) * 100,
  );

  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">My Profile</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Your account details. Add any missing info whenever you like.
        </p>
      </RevealSection>

      <section className="mx-auto my-16 max-w-3xl px-6 md:my-20">
        {!profile ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-8 text-center">
            {loadFailed ? (
              <>
                <p className="text-white/70">We couldn't load your profile.</p>
                <button type="button" onClick={load} className={`${primaryButton} mt-6`}>
                  Try Again
                </button>
              </>
            ) : (
              <p className="text-white/50">Loading your profile…</p>
            )}
          </div>
        ) : editing && form ? (
          <form
            onSubmit={handleSave}
            className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8"
          >
            <h2 className="text-xl font-medium text-white">Edit Profile</h2>

            <div className="flex flex-wrap items-center gap-5">
              <Avatar
                url={form.avatarUrl || null}
                initials={initialsOf({ fullName: form.fullName, username: form.username || "?" })}
                size="md"
              />
              <div className="flex flex-wrap gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AVATAR_TYPES.join(",")}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || saving}
                  className={secondaryButton}
                >
                  {uploading ? "Uploading…" : form.avatarUrl ? "Change Photo" : "Add Photo"}
                </button>
                {form.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setField("avatarUrl", "")}
                    disabled={uploading || saving}
                    className="px-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Username" hint="Required">
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value)}
                  maxLength={50}
                  className={inputClasses}
                />
              </Field>
              <Field label="Full Name">
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  className={inputClasses}
                  placeholder="e.g. Ahmed Hassan"
                />
              </Field>
              <Field label="Phone" hint="Required">
                <input
                  type="tel"
                  aria-required="true"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  maxLength={30}
                  autoComplete="tel"
                  className={inputClasses}
                  placeholder="+20 100 000 0000"
                />
              </Field>
              <Field label="Job Title">
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => setField("jobTitle", e.target.value)}
                  maxLength={100}
                  autoComplete="organization-title"
                  className={inputClasses}
                  placeholder="e.g. Sales Manager"
                />
              </Field>
              <Field label="Location">
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  maxLength={100}
                  className={inputClasses}
                  placeholder="e.g. Cairo, Egypt"
                />
              </Field>
              <Field label="Email" hint="Used to sign in">
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className={`${inputClasses} cursor-not-allowed text-white/50`}
                />
              </Field>
            </div>

            <Field label="Bio" hint={`${form.bio.length}/${BIO_MAX}`}>
              <textarea
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                maxLength={BIO_MAX}
                rows={4}
                className={`${inputClasses} resize-y`}
                placeholder="A few words about you and your role at Sanipure"
              />
            </Field>

            <div className="mt-2 flex flex-wrap gap-3">
              <button type="submit" disabled={saving || uploading} className={primaryButton}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className={secondaryButton}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 text-center sm:flex-row sm:p-8 sm:text-left">
              <Avatar url={profile.avatarUrl} initials={initialsOf(profile)} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="break-words text-2xl font-semibold text-white">
                  {profile.fullName || profile.username}
                </h2>
                <p className="mt-1 text-sm text-white/50">@{profile.username}</p>
                {(profile.jobTitle || profile.location) && (
                  <p className="mt-2 text-sm text-white/70">
                    {[profile.jobTitle, profile.location].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <button type="button" onClick={startEditing} className={secondaryButton}>
                Edit Profile
              </button>
            </div>

            {missing.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium text-white">Complete your profile</p>
                  <p className="text-sm text-white/60">{completion}%</p>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={completion}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Profile completion"
                >
                  <div className="h-full rounded-full bg-white" style={{ width: `${completion}%` }} />
                </div>
                <p className="mt-3 text-sm text-white/60">
                  Still missing: {missing.map((f) => f.label).join(", ")}.
                </p>
                <button type="button" onClick={startEditing} className={`${primaryButton} mt-5`}>
                  Complete Profile
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] px-6 py-2 sm:px-8">
              <dl>
                <DetailRow label="Full Name" value={profile.fullName} />
                <DetailRow label="Username" value={profile.username} />
                <DetailRow label="Email" value={profile.email} />
                <DetailRow label="Phone" value={profile.phone} />
                <DetailRow label="Job Title" value={profile.jobTitle} />
                <DetailRow label="Location" value={profile.location} />
                <DetailRow
                  label="Bio"
                  value={profile.bio && <span className="whitespace-pre-line">{profile.bio}</span>}
                />
              </dl>
            </div>

            <WishlistSection />

            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
              <p className="text-sm text-white/50">Member since</p>
              <p className="mt-1 text-lg text-white">
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ProfilePage;
