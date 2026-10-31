import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import heroImage from "../assets/who we are photos/Factory 1.png";
// Arkan 205 — same photo as on the Projects page.
import projectImage from "../assets/projects photos/project 3.JPG";

const CONTACT_EMAIL = "info@sanipure-eg.com";

// Same places as the footer's location links.
const locations = {
  hq: {
    label: "Head Quarters",
    mapsUrl: "https://maps.app.goo.gl/SH1X8QyuMLeNyZ3J9",
  },
  factory: {
    label: "Factory",
    mapsUrl: "https://maps.app.goo.gl/YC6qkUwULUoKTP359",
  },
} as const;

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-8 w-8",
  "aria-hidden": true,
};

const contactItems: { title: string; detail: string; href: string; external?: boolean; icon: ReactNode }[] = [
  {
    title: "Hotline",
    detail: "15684",
    href: "tel:15684",
    icon: (
      <svg {...iconProps}>
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
      </svg>
    ),
  },
  {
    title: "Email Address",
    detail: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    title: "Head Quarters",
    detail: "Sanipure HQ · View on map",
    href: locations.hq.mapsUrl,
    external: true,
    icon: (
      <svg {...iconProps}>
        <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" />
        <path d="M15 9h4a1 1 0 0 1 1 1v11" />
        <path d="M3 21h18M8 8h3M8 12h3M8 16h3" />
      </svg>
    ),
  },
  {
    title: "Factory",
    detail: "10th of Ramadan – Badr Road",
    href: locations.factory.mapsUrl,
    external: true,
    icon: (
      <svg {...iconProps}>
        <path d="M3 21V11l5 3V11l5 3V5h4l1 9h3v7z" />
        <path d="M3 21h18" />
      </svg>
    ),
  },
];

const fieldLabel = "mb-2 block font-brand text-sm font-semibold uppercase text-white";
const fieldInput =
  "w-full bg-[#3a3a3a] px-3 py-2.5 text-sm text-white outline-none ring-1 ring-transparent transition [color-scheme:dark] focus:ring-white/70";

// The short fields, two to a row on wide screens; "wide" ones span the row.
const formFields = [
  { name: "firstName", label: "First Name", type: "text", autoComplete: "given-name" },
  { name: "lastName", label: "Last Name", type: "text", autoComplete: "family-name" },
  { name: "email", label: "Email Address", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone Number", type: "tel", autoComplete: "tel" },
  { name: "location", label: "Location", type: "text", autoComplete: "address-level2" },
  { name: "date", label: "Date", type: "date" },
  { name: "subject", label: "Subject", type: "text", wide: true },
] as const;
// Thin outlined lettering for the small labels above headings, as in the design.
const outlinedLabel =
  "font-brand text-lg font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.7)] md:text-xl";

const FindUsPage = () => {
  // Links like the Resources page's "Request a Catalog" pass ?subject= to
  // start the message with what the visitor is asking for.
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => ({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    date: "",
    subject: searchParams.get("subject") ?? "",
    message: "",
  }));

  const update = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // There's no mail service on the backend yet, so "Send Now" opens the
  // visitor's own email app with the message already addressed and filled in.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const { firstName, lastName, email, phone, location, date, subject, message } = form;
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!name || !email.trim() || !message.trim()) {
      showErrorToast("Please fill in your name, email and details.");
      return;
    }
    const extras = [
      phone.trim() && `Phone: ${phone.trim()}`,
      location.trim() && `Location: ${location.trim()}`,
      date && `Date: ${date}`,
    ].filter(Boolean);
    const body = [`${message.trim()}\n\n— ${name} (${email.trim()})`, ...extras].join("\n");
    const params = new URLSearchParams({
      subject: subject.trim() || `Website message from ${name}`,
      body,
    });
    // URLSearchParams encodes spaces as "+", which mail apps show literally.
    window.location.href = `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, "%20")}`;
    showSuccessToast("Opening your email app…");
  };

  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative flex h-[360px] items-end justify-center overflow-hidden pb-10 md:h-[480px] md:pb-14">
        {/* The SANIPURE sign sits high on the building (about 13–25% down the
            photo), so the crop leans to the top to keep it in view on wide
            screens. The photo fades to black at the bottom, where the title
            sits, and stays bright above so the sign still reads. */}
        <img
          src={heroImage}
          alt="The Sanipure factory"
          className="absolute inset-0 h-full w-full object-cover object-[center_10%]"
        />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <RevealSection className="relative px-6 text-center">
          <h1 className="font-brand text-4xl font-semibold uppercase text-white md:text-6xl">Contact Us</h1>
          <p className="mt-1 font-brand text-base uppercase text-white/85 md:text-2xl">
            We'd love to hear what you think
          </p>
        </RevealSection>
      </section>

      {/* Form + contact details */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-14 md:grid-cols-2 md:py-20 lg:gap-16">
        <RevealSection>
          <h2 className="font-brand text-3xl font-semibold uppercase text-white md:text-4xl">
            Let's <span className="text-white/75">Work</span> Together
          </h2>

          <form onSubmit={handleSubmit} className="mt-8" noValidate>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {formFields.map((field) => (
                <div key={field.name} className={"wide" in field ? "sm:col-span-2" : undefined}>
                  <label htmlFor={`contact-${field.name}`} className={fieldLabel}>
                    {field.label}
                  </label>
                  <input
                    id={`contact-${field.name}`}
                    type={field.type}
                    autoComplete={"autoComplete" in field ? field.autoComplete : undefined}
                    value={form[field.name]}
                    onChange={(e) => update(field.name)(e.target.value)}
                    className={fieldInput}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label htmlFor="contact-message" className={fieldLabel}>
                  Details
                </label>
                <textarea
                  id="contact-message"
                  rows={8}
                  value={form.message}
                  onChange={(e) => update("message")(e.target.value)}
                  className={`${fieldInput} resize-y`}
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-10 w-full border border-white/70 py-3 font-brand text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
            >
              Submit
            </button>
          </form>
        </RevealSection>

        <RevealSection className="flex flex-col">
          <p className="text-sm leading-relaxed text-white/80">
            Whether you're choosing products for your home, planning a hotel or commercial project,
            or need after-sales support, our team is here to help. Call our hotline, send us an
            email, or visit our head quarters or factory.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-9">
            {contactItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group flex flex-col items-center text-center text-white"
              >
                <span className="transition-transform group-hover:-translate-y-0.5">{item.icon}</span>
                <span className="mt-3 font-brand text-base font-semibold">{item.title}</span>
                <span className="mt-1 break-all text-xs text-white/70 transition-colors group-hover:text-white sm:text-sm">
                  {item.detail}
                </span>
              </a>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Call to action */}
      <section className="px-6 pb-24 md:pb-32">
        <RevealSection className="relative mx-auto flex h-[300px] max-w-6xl items-center justify-center overflow-hidden md:h-[360px]">
          <img src={projectImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative px-6 text-center">
            <p className={outlinedLabel}>Work With Us</p>
            <h2 className="mt-1 font-brand text-3xl font-semibold leading-tight text-white md:text-5xl">
              Planning A Project?
              <br />
              Let's Build It Together
            </h2>
            <Link
              to="/projects"
              className="mt-7 inline-block rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-colors hover:bg-white/85"
            >
              View Our Projects
            </Link>
          </div>
        </RevealSection>
      </section>
    </div>
  );
};

export default FindUsPage;
