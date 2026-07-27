import { Link } from "react-router-dom";
import logo from "../assets/RGB_Logo_400_White.png";

const navigationLinks = [
  { label: "Home", to: "/" },
  { label: "Who We Are", to: "/who-we-are" },
  { label: "Products", to: "/products" },
  { label: "Projects", to: "/projects" },
];

const quickLinks = [
  { label: "News", to: "/news" },
  { label: "Resources", to: "/resources" },
  { label: "Find Us", to: "/find-us" },
  { label: "Contact Us", to: "/contact-us" },
];

const serviceLinks = [
  { label: "Washbasins", to: "/products/washbasins" },
  { label: "Bathtubs", to: "/products/bathtubs" },
  { label: "Toilets", to: "/products/toilets" },
  { label: "Accessories", to: "/products/accessories" },
];

const contactDetails = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.6c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.2.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
      </svg>
    ),
    label: "15684",
    description: "Call our hotline for support and product inquiries.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.5 7.3 5.6a.8.8 0 0 0 1 0L19.8 6H4.2Z" />
      </svg>
    ),
    label: "info@sanipure-eg.com",
    description: "Send us your questions and we'll get back to you.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
      </svg>
    ),
    label: "Cairo, Egypt",
    description: "Visit our showroom for a live product experience.",
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M13.5 21v-7.5H16l.5-3h-3V8.4c0-.9.3-1.5 1.6-1.5H16.5V4.2C16.2 4.1 15.3 4 14.2 4c-2.3 0-3.9 1.4-3.9 4v2.5H7.8v3h2.5V21h3.2Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.9 7.4a5.5 5.5 0 0 0-1.5-3.9 5.5 5.5 0 0 0-3.9-1.5c-1.5-.1-6.1-.1-7.6 0a5.5 5.5 0 0 0-3.9 1.5 5.5 5.5 0 0 0-1.5 3.9c-.1 1.5-.1 6.1 0 7.6a5.5 5.5 0 0 0 1.5 3.9 5.5 5.5 0 0 0 3.9 1.5c1.5.1 6.1.1 7.6 0a5.5 5.5 0 0 0 3.9-1.5 5.5 5.5 0 0 0 1.5-3.9c.1-1.5.1-6.1 0-7.6Zm-1.9 9.2a3.1 3.1 0 0 1-1.8 1.8c-1.2.5-4.2.4-5.6.4s-4.3.1-5.6-.4a3.1 3.1 0 0 1-1.8-1.8c-.5-1.2-.4-4.2-.4-5.6s-.1-4.3.4-5.6A3.1 3.1 0 0 1 7 3.6c1.2-.5 4.2-.4 5.6-.4s4.3-.1 5.6.4a3.1 3.1 0 0 1 1.8 1.8c.5 1.2.4 4.2.4 5.6s.1 4.3-.4 5.6Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M21.6 7.6a2.7 2.7 0 0 0-1.9-1.9C18 5.2 12 5.2 12 5.2s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.6 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.4 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.3-1.5.4-3 .4-4.4a28 28 0 0 0-.4-4.4ZM10 15V9l5.2 3-5.2 3Z" />
      </svg>
    ),
  },
];

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) => (
  <div>
    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
      {title}
    </h3>
    <ul className="mt-6 space-y-3">
      {links.map((link) => (
        <li key={link.label} className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-white/50" />
          <Link
            to={link.to}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-black py-16">
      <div className="container mx-auto grid grid-cols-1 gap-12 px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <img src={logo} alt="Sanipure" className="h-8 w-auto" />

          <h2 className="mt-8 text-2xl font-semibold text-white">
            Shaping places around the world — Contact Us !
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Premium sanitary ware and bath fittings for homes, hotels and
            projects across Egypt — built to make every bathroom feel
            considered.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Navigation" links={navigationLinks} />
        <FooterColumn title="Quick Link" links={quickLinks} />
        <FooterColumn title="Services" links={serviceLinks} />
      </div>

      <div className="container mx-auto mt-16 grid grid-cols-1 gap-8 px-6 sm:grid-cols-3">
        {contactDetails.map((detail) => (
          <div key={detail.label}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center bg-white text-black">
                {detail.icon}
              </span>
              <span className="text-base font-semibold text-white">
                {detail.label}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {detail.description}
            </p>
          </div>
        ))}
      </div>

      <div className="container mx-auto mt-16 border-t border-white/10 px-6 pt-6">
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} Sanipure. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
