import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import logo from "../assets/RGB_Logo_400_White.png";
import { useHeaderVisibility } from "../hooks/useHeaderVisibility";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import {
  AUTH_CHANGED_EVENT,
  getStoredUser,
  signOut,
  type AuthUser,
} from "../api/clientApi";
import { showSuccessToast } from "../lib/toast";

const navItems = [
  { label: "Who We Are", to: "/who-we-are" },
  { label: "Products", to: "/products" },
  { label: "Projects", to: "/projects" },
  { label: "News", to: "/news" },
  { label: "Resources", to: "/resources" },
  { label: "Find Us", to: "/find-us" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const scrollVisible = useHeaderVisibility();
  const prefersReducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const visible = isOpen || scrollVisible;

  useEffect(() => {
    const refreshUser = () => setUser(getStoredUser());
    window.addEventListener(AUTH_CHANGED_EVENT, refreshUser);
    window.addEventListener("storage", refreshUser);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSignOut = () => {
    signOut();
    setDropdownOpen(false);
    setIsOpen(false);
    showSuccessToast("Signed out successfully");
    navigate("/");
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-black"
      animate={
        prefersReducedMotion
          ? { y: 0, opacity: 1 }
          : { y: visible ? 0 : -100, opacity: visible ? 1 : 0 }
      }
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="flex items-center"
          onClick={() => setIsOpen(false)}
        >
          <img src={logo} alt="Sanipure" className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-xs font-medium uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li ref={dropdownRef} className="relative">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    aria-expanded={dropdownOpen}
                    className="text-xs font-medium uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-white"
                  >
                    {user.username}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-44 rounded-md border border-white/10 bg-black py-2 shadow-lg">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2 text-left text-xs font-medium uppercase tracking-[0.1em] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/admin"
                  className="text-xs font-medium uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-white"
                >
                  Admin
                </Link>
              )}
            </li>
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="text-white md:hidden"
        >
          {isOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      <nav
        className={`overflow-hidden bg-black transition-[max-height] duration-300 ease-in-out md:hidden ${
          isOpen ? "max-h-[32rem]" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col px-6 pb-4">
          {navItems.map((item) => (
            <li key={item.to} className="border-b border-white/10">
              <Link
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="block py-4 text-sm font-medium uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}

          {user ? (
            <>
              <li className="border-b border-white/10">
                <span className="block py-4 text-sm font-medium uppercase tracking-[0.12em] text-white/50">
                  {user.username}
                </span>
              </li>
              <li className="border-b border-white/10">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block py-4 text-sm font-medium uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
              <li className="border-b border-white/10">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full py-4 text-left text-sm font-medium uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-white"
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li className="border-b border-white/10">
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block py-4 text-sm font-medium uppercase tracking-[0.12em] text-white/90 transition-colors hover:text-white"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </motion.header>
  );
};

export default Header;
