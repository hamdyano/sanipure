import { useState } from "react";

interface Filter {
  id: string;
  label: string;
  options: string[];
}

interface FilterSidebarProps {
  filters: Filter[];
  selected: Record<string, string[]>;
  onToggle: (filterId: string, option: string) => void;
  onClear: () => void;
  getCount: (filterId: string, option: string) => number;
  resultCount: number;
}

const FilterSidebar = ({
  filters,
  selected,
  onToggle,
  onClear,
  getCount,
  resultCount,
}: FilterSidebarProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (filterId: string) => {
    setOpenSections((prev) => ({ ...prev, [filterId]: !prev[filterId] }));
  };

  const activeChips = filters.flatMap((filter) =>
    (selected[filter.id] ?? []).map((option) => ({ filterId: filter.id, option }))
  );

  return (
    <div>
      <p className="text-sm font-medium text-white/60">
        {resultCount} {resultCount === 1 ? "Result" : "Results"}
      </p>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          {activeChips.map(({ filterId, option }) => (
            <button
              key={`${filterId}-${option}`}
              type="button"
              onClick={() => onToggle(filterId, option)}
              className="flex items-center gap-2 border border-white/30 px-3 py-1 text-xs text-white/80 transition-colors hover:border-white hover:text-white"
            >
              {option}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-white/50 underline underline-offset-4 transition-colors hover:text-white"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-col">
        {filters.map((filter) => {
          const isOpen = !!openSections[filter.id];
          return (
            <div key={filter.id} className="border-b border-white/10">
              <button
                type="button"
                onClick={() => toggleSection(filter.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold uppercase tracking-wide text-white"
              >
                {filter.label}
                <span aria-hidden="true" className="text-lg font-normal text-white/60">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-2 pb-4">
                  {filter.options.map((option) => {
                    const checked = (selected[filter.id] ?? []).includes(option);
                    const count = getCount(filter.id, option);
                    return (
                      <label
                        key={option}
                        className="flex items-center justify-between gap-2 text-sm text-white/80"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggle(filter.id, option)}
                            className="h-4 w-4 accent-white"
                          />
                          {option}
                        </span>
                        <span className="text-white/40">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilterSidebar;
