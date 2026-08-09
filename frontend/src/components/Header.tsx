import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import logo from "../assets/RGB_Logo_400_White.png";
import { useHeaderVisibility } from "../hooks/useHeaderVisibility";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

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
  const scrollVisible = useHeaderVisibility();
  const prefersReducedMotion = usePrefersReducedMotion();
  const visible = isOpen || scrollVisible;

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
          isOpen ? "max-h-96" : "max-h-0"
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
        </ul>
      </nav>
    </motion.header>
  );
};

export default Header;
