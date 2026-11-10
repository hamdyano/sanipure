import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import RevealSection from "../components/shared/RevealSection";
import { CATEGORIES } from "../data/categories";
import { getLeads, isAuthenticated, signOut, type Lead } from "../api/clientApi";
import { productPagePath } from "../lib/productPaths";
import { showErrorToast } from "../lib/toast";

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const headerCell = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-white/50";
const bodyCell = "px-4 py-4 align-top text-sm text-white";
// Contact details sit level with the first product line.
const contactCell = "px-4 pb-4 pt-8 align-top text-sm text-white";
// Every product line (and its date beside it) is this tall, so the Product
// and Date & Time columns stay lined up item by item.
const productLine = "flex h-14 items-center";

/**
 * Dashboard → "Leads Report": everyone who saved a product to their
 * wishlist, one row per person listing all the products they saved. The
 * person with the most recent save comes first.
 */
// Paper / PDF layout: landscape A4, black text on white, no site header or
// footer (those hide themselves via print:hidden), and a person's row is
// never split across two pages. Rendered only while this page is open, so
// printing other pages is unaffected.
const PRINT_STYLES = `
@media print {
  @page { size: A4 landscape; margin: 12mm; }
  html, body, body > div, main { background: #fff !important; }
  .leads-report, .leads-report * { color: #111 !important; }
  .leads-report .leads-muted { color: #555 !important; }
  .leads-report tr { border-color: #d4d4d4 !important; break-inside: avoid; }
  .leads-report a { text-decoration: none !important; }
  .leads-report .leads-thumb {
    background: #f2f2f2 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

const LeadsReportPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [printedAt, setPrintedAt] = useState<Date | null>(null);

  const fetchLeads = useCallback(
    () =>
      getLeads().then(setLeads, (err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          signOut();
          showErrorToast("Your session expired. Please sign in again.");
          navigate("/admin", { replace: true, state: { from: "/dashboard/leads" } });
        } else {
          setLoadFailed(true);
        }
      }),
    [navigate],
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin", { replace: true, state: { from: "/dashboard/leads" } });
      return;
    }
    fetchLeads();
  }, [navigate, fetchLeads]);

  const savedCount = leads?.reduce((total, lead) => total + lead.products.length, 0) ?? 0;

  const retry = () => {
    setLoadFailed(false);
    fetchLeads();
  };

  const countSummary = leads
    ? `${leads.length} ${leads.length === 1 ? "person" : "people"} · ${savedCount} saved ${
        savedCount === 1 ? "product" : "products"
      }`
    : "";

  // Opens the browser's print dialog, where "Save as PDF" is a destination.
  // The print styles below lay the report out for paper; the temporary page
  // title becomes the suggested file name.
  const saveAsPdf = () => {
    const previousTitle = document.title;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    document.title = `Sanipure Leads Report ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };
    window.addEventListener("afterprint", restoreTitle);
    setPrintedAt(now);
    // Let React render the "Generated …" time before the dialog opens.
    requestAnimationFrame(() => window.print());
  };

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28 print:hidden">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">Leads Report</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Everyone who saved a product to their wishlist, newest first.
        </p>
      </RevealSection>

      <section className="leads-report mx-auto my-16 max-w-6xl px-4 sm:px-6 md:my-20 print:m-0 print:max-w-none print:p-0">
        {/* Only on paper / in the PDF. */}
        <div className="mb-6 hidden print:block">
          <h1 className="text-2xl font-semibold">Sanipure · Leads Report</h1>
          <p className="leads-muted mt-1 text-sm">
            {[printedAt && `Generated ${formatDateTime(printedAt.toISOString())}`, countSummary]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            to="/dashboard"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            ← Back to Dashboard
          </Link>
          {leads && leads.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-white/50">{countSummary}</p>
              <button
                type="button"
                onClick={saveAsPdf}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
                Save as PDF
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] print:rounded-none print:border-0 print:bg-transparent">
          {loadFailed ? (
            <div className="p-8 text-center">
              <p className="text-white/70">We couldn't load the leads report.</p>
              <button
                type="button"
                onClick={retry}
                className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80"
              >
                Try Again
              </button>
            </div>
          ) : !leads ? (
            <p className="p-8 text-center text-white/50">Loading leads…</p>
          ) : leads.length === 0 ? (
            <p className="p-8 text-center text-white/60">
              No leads yet. When signed-in users save products with the heart button, they'll
              show up here.
            </p>
          ) : (
            // Scrolls sideways inside the card on narrow screens instead of
            // squeezing the columns.
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-[820px] border-collapse print:min-w-0">
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className={headerCell}>Name</th>
                    <th scope="col" className={headerCell}>Email</th>
                    <th scope="col" className={headerCell}>Phone</th>
                    <th scope="col" className={headerCell}>Products</th>
                    <th scope="col" className={headerCell}>Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.userId}
                      className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.03]"
                    >
                      <td className={`${contactCell} font-medium`}>{lead.name}</td>
                      <td className={contactCell}>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-white/80 underline-offset-4 hover:text-white hover:underline"
                        >
                          {lead.email}
                        </a>
                      </td>
                      <td className={`${contactCell} whitespace-nowrap`}>
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                            className="text-white/80 underline-offset-4 hover:text-white hover:underline"
                          >
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="leads-muted text-white/35">Not added</span>
                        )}
                      </td>
                      <td className={bodyCell}>
                        <ul className="flex flex-col gap-2">
                          {lead.products.map((product) => {
                            const category = CATEGORIES.find((c) => c.id === product.category);
                            const image = product.image ?? category?.image;
                            return (
                              <li key={product.id} className={productLine}>
                                <Link
                                  to={productPagePath(product.category, product.id)}
                                  className="group flex min-w-0 items-center gap-3"
                                >
                                  <span className="leads-thumb flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/5">
                                    {image ? (
                                      <img
                                        src={image}
                                        alt=""
                                        className="max-h-full max-w-full object-contain"
                                      />
                                    ) : (
                                      <span className="text-[10px] text-white/30">No image</span>
                                    )}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block max-w-[16rem] truncate group-hover:underline group-hover:underline-offset-4">
                                      {product.name}
                                    </span>
                                    <span className="leads-muted block max-w-[16rem] truncate text-xs text-white/50">
                                      {category?.name ?? product.category}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                      <td className={`${bodyCell} whitespace-nowrap text-white/80`}>
                        <ul className="flex flex-col gap-2">
                          {lead.products.map((product) => (
                            <li key={product.id} className={productLine}>
                              <time dateTime={product.addedAt}>
                                {formatDateTime(product.addedAt)}
                              </time>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default LeadsReportPage;
