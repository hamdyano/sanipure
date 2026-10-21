import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import heroImage from "../assets/who we are photos/Factory 1.png";
// Arkan 205 — same photo as on the Projects page.
import projectImage from "../assets/projects photos/project 3.JPG";

const CONTACT_EMAIL = "info@sanipure-eg.com";

// Same places as the footer's location links. Each map is embedded by its
// Google Maps place id (cid, read from those links), so it shows the pin and
// the place's own card with its name and address.
const locations = {
  hq: {
    label: "Head Quarters",
    mapsUrl: "https://maps.app.goo.gl/SH1X8QyuMLeNyZ3J9",
    embedUrl: "https://maps.google.com/maps?cid=4836581143482261441&z=16&output=embed",
  },
  factory: {
    label: "Factory",
    mapsUrl: "https://maps.app.goo.gl/YC6qkUwULUoKTP359",
    embedUrl: "https://maps.google.com/maps?cid=1647109058578589726&z=15&output=embed",
  },
} as const;

type LocationId = keyof typeof locations;

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

const fieldLabel = "mb-1.5 block text-xs text-white/45";
const fieldInput =
  "w-full border border-white/30 bg-[#2f2f2f] px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none transition-colors focus:border-white";
// Thin outlined lettering for the small labels above headings, as in the design.
const outlinedLabel =
  "font-brand text-lg font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.7)] md:text-xl";

const FindUsPage = () => {
  // Links like the Resources page's "Request a Catalog" pass ?subject= to
  // start the message with what the visitor is asking for.
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    subject: searchParams.get("subject") ?? "",
    message: "",
  }));
  const [mapId, setMapId] = useState<LocationId>("hq");

  const update = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // There's no mail service on the backend yet, so "Send Now" opens the
  // visitor's own email app with the message already addressed and filled in.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const { name, email, subject, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) {
      showErrorToast("Please fill in your name, email and message.");
      return;
    }
    const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
    const params = new URLSearchParams({
      subject: subject.trim() || `Website message from ${name.trim()}`,
      body,
    });
    // URLSearchParams encodes spaces as "+", which mail apps show literally.
    window.location.href = `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, "%20")}`;
    showSuccessToast("Opening your email app…");
  };

  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative flex h-[280px] items-center justify-center overflow-hidden md:h-[340px]">
        {/* The SANIPURE sign sits high on the building (about 13–25% down the
            photo), so the crop leans to the top to keep it in view on wide
            screens. The overlay stays light so the dark lettering still reads
            against the white wall; only the middle, behind the title, is
            darkened. */}
        <img
          src={heroImage}
          alt="The Sanipure factory"
          className="absolute inset-0 h-full w-full object-cover object-[center_10%]"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_center,rgba(0,0,0,0.6),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
        <RevealSection className="relative px-6 text-center">
          <h1 className="font-brand text-5xl font-semibold text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.6)] md:text-6xl">Find Us</h1>
          <nav aria-label="Breadcrumb" className="mt-3 text-xs text-white/75 md:text-sm">
            <Link to="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="mx-3" aria-hidden>
              /
            </span>
            <span aria-current="page">Find Us</span>
          </nav>
        </RevealSection>
      </section>

      {/* Form + contact details */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-14 md:grid-cols-2 md:py-20 lg:gap-16">
        <RevealSection className="bg-[#232323] p-7 md:p-10">
          <p className={outlinedLabel}>Contact Us</p>
          <h2 className="font-brand text-3xl font-semibold text-white md:text-4xl">Get In Touch</h2>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="find-us-name" className={fieldLabel}>
                Name
              </label>
              <input
                id="find-us-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name")(e.target.value)}
                placeholder="Your Name…"
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="find-us-email" className={fieldLabel}>
                Email
              </label>
              <input
                id="find-us-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email")(e.target.value)}
                placeholder="example@yourmail.com"
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="find-us-subject" className={fieldLabel}>
                Subject
              </label>
              <input
                id="find-us-subject"
                type="text"
                value={form.subject}
                onChange={(e) => update("subject")(e.target.value)}
                placeholder="Title…"
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="find-us-message" className={fieldLabel}>
                Message
              </label>
              <textarea
                id="find-us-message"
                rows={5}
                value={form.message}
                onChange={(e) => update("message")(e.target.value)}
                placeholder="Type Here…"
                className={`${fieldInput} resize-y`}
              />
            </div>
            <button
              type="submit"
              className="mt-3 rounded-full border border-white/70 py-3 text-sm text-white transition-colors hover:bg-white hover:text-black"
            >
              Send Now
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

          <div className="mt-10">
            <div className="mb-3 flex gap-2" role="group" aria-label="Map location">
              {(Object.keys(locations) as LocationId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMapId(id)}
                  aria-pressed={mapId === id}
                  className={`rounded-full px-4 py-1.5 font-brand text-xs uppercase tracking-wide transition-colors ${
                    mapId === id ? "bg-white text-black" : "border border-white/40 text-white/80 hover:border-white"
                  }`}
                >
                  {locations[id].label}
                </button>
              ))}
            </div>
            <iframe
              key={mapId}
              title={`Map: Sanipure ${locations[mapId].label}`}
              src={locations[mapId].embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-64 w-full border-0 md:h-72"
            />
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
