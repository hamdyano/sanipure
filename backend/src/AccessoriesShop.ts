import type { CatalogEntry } from "./washbasinsShop";

// Filters for the accessories & furniture catalog. Products are entirely
// DB-backed (added through the admin dashboard) — see getDbProducts in
// products.ts. The first seven types are accessories, the last three
// furniture; "shape" only applies to cabinets.
export const accessoriesShop: CatalogEntry = {
  filters: [
    {
      id: "type",
      label: "Type",
      options: [
        "Towel Holders",
        "Hooks",
        "Toilet Roll Holders",
        "Soap Dishes",
        "Soap Dispensers",
        "Shelves",
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
