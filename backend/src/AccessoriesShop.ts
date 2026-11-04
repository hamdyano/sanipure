import type { CatalogEntry } from "./washbasinsShop";

// Filters for the accessories & furniture catalog. Products are entirely
// DB-backed (added through the admin dashboard) — see getDbProducts in
// products.ts. The first four types are accessories, the last three
// furniture; "shape" only applies to cabinets.
export const accessoriesShop: CatalogEntry = {
  filters: [
    {
      id: "type",
      label: "Type",
      options: [
        "Towel Holders",
        "Toilet Roll Holders",
        "Soap Dispensers",
        "Mirrors",
        "Cabinet",
        "Over-Counter",
        "Counter-Top",
      ],
    },
    {
      id: "shape",
      label: "Cabinet Shape",
      options: ["Circular", "Rectangular"],
    },
  ],
  products: [],
};
