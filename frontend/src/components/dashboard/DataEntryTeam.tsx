import { useEffect, useState } from "react";
import axios from "axios";
import {
  getDataEntryTeam,
  searchVisitors,
  setUserRole,
  type TeamMember,
} from "../../api/clientApi";
import {
  showErrorToast,
  showSuccessToast,
  showUnexpectedErrorToast,
} from "../../lib/toast";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DELAY_MS = 300;

const reportError = (err: unknown) => {
  if (axios.isAxiosError(err) && typeof err.response?.data?.message === "string") {
    showErrorToast(err.response.data.message);
  } else {
    showUnexpectedErrorToast();
  }
};

const MemberRow = ({
  member,
  saving,
  onToggle,
}: {
  member: TeamMember;
  saving: boolean;
  onToggle: () => void;
}) => (
  <li className="border-b border-white/10 last:border-b-0">
    <label className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-white/5">
      <input
        type="checkbox"
        checked={member.role === "data_entry"}
        disabled={saving}
        onChange={onToggle}
        className="h-5 w-5 shrink-0 cursor-pointer accent-white disabled:cursor-wait disabled:opacity-50"
      />
      <span className="min-w-0 flex-1">
        <span className="block break-all text-sm text-white">{member.email}</span>
        <span className="block truncate text-xs text-white/50">{member.name}</span>
      </span>
      <span className="shrink-0 text-right text-xs text-white/50">
        {saving
          ? "Saving…"
          : member.role === "data_entry"
            ? `${member.productCount} ${member.productCount === 1 ? "product" : "products"}`
            : "Visitor"}
      </span>
    </label>
  </li>
);

/**
 * The admin's list of data entry accounts. Unchecking one makes it a visitor
 * again; it stays listed (unchecked) until the page is reloaded, so a mistake
 * can be undone. Other visitors are added by searching for their email.
 */
const DataEntryTeam = () => {
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [query, setQuery] = useState("");
  // Keyed by the text they're for, so results for an older search never show.
  const [found, setFound] = useState<{ query: string; members: TeamMember[] } | null>(null);
  const [savingIds, setSavingIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    getDataEntryTeam()
      .then((members) => !cancelled && setTeam(members))
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = () => {
    setLoadFailed(false);
    getDataEntryTeam().then(setTeam, () => setLoadFailed(true));
  };

  const search = query.trim();
  useEffect(() => {
    if (search.length < MIN_SEARCH_LENGTH) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchVisitors(search)
        .then((members) => !cancelled && setFound({ query: search, members }))
        .catch((err) => !cancelled && reportError(err));
    }, SEARCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const toggle = async (member: TeamMember) => {
    const role = member.role === "data_entry" ? "visitor" : "data_entry";
    setSavingIds((prev) => new Set(prev).add(member.id));
    try {
      const updated = await setUserRole(member.id, role);
      setTeam((prev) => {
        const list = prev ?? [];
        return list.some((m) => m.id === updated.id)
          ? list.map((m) => (m.id === updated.id ? updated : m))
          : [...list, updated];
      });
      showSuccessToast(
        role === "data_entry"
          ? `${updated.email} is now data entry`
          : `${updated.email} is now a visitor`,
      );
    } catch (err) {
      reportError(err);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    }
  };

  const results = found && found.query === search ? found.members : null;
  // Anyone already in the list above is checked or unchecked there instead.
  const listedIds = new Set(team?.map((member) => member.id));
  const newResults = results?.filter((member) => !listedIds.has(member.id)) ?? [];
  const activeCount = team?.filter((member) => member.role === "data_entry").length ?? 0;

  return (
    <section
      aria-labelledby="data-entry-title"
      className="mb-12 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8"
    >
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h2 id="data-entry-title" className="text-2xl font-semibold text-white">
          Data Entry
        </h2>
        {team && <span className="text-sm text-white/50">{activeCount} active</span>}
      </div>
      <p className="mb-6 text-sm text-white/60">
        Checked accounts can add products. Uncheck an account to make it a visitor only.
      </p>

      {loadFailed ? (
        <p className="text-sm text-red-400">
          Couldn't load the data entry accounts.{" "}
          <button type="button" onClick={retry} className="underline hover:text-red-300">
            Try again
          </button>
        </p>
      ) : !team ? (
        <p className="text-sm text-white/60">Loading accounts…</p>
      ) : team.length === 0 ? (
        <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60">
          No data entry accounts yet. Search for an email below to add one.
        </p>
      ) : (
        <ul className="rounded-xl border border-white/10">
          {team.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              saving={savingIds.has(member.id)}
              onToggle={() => toggle(member)}
            />
          ))}
        </ul>
      )}

      {team && (
        <div className="mt-8">
          <label htmlFor="visitor-search" className="mb-1 block text-sm text-white/70">
            Add from visitor accounts
          </label>
          <input
            id="visitor-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            placeholder="Search by email"
            className="w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white"
          />
          {search.length >= MIN_SEARCH_LENGTH &&
            (!results ? (
              <p className="mt-3 text-sm text-white/60">Searching…</p>
            ) : newResults.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">
                No other visitor account matches this email.
              </p>
            ) : (
              <ul className="mt-3 rounded-xl border border-white/10">
                {newResults.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    saving={savingIds.has(member.id)}
                    onToggle={() => toggle(member)}
                  />
                ))}
              </ul>
            ))}
        </div>
      )}
    </section>
  );
};

export default DataEntryTeam;
