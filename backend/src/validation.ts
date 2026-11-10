export const PHONE_MAX_LENGTH = 30;
export const USERNAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;

// Digits with optional leading "+", spaces, dashes and brackets,
// e.g. "+20 100 000 0000" or "(02) 2345-6789".
export const isValidPhone = (phone: string) => /^\+?[0-9\s\-()]{6,30}$/.test(phone);

// Something@something.something, no spaces.
export const isValidEmail = (email: string) =>
  email.length <= EMAIL_MAX_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// A request body field as a trimmed string ("" if missing or not a string).
export const trimmedField = (value: unknown) => (typeof value === "string" ? value.trim() : "");
