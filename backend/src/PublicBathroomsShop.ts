import type { CatalogEntry } from "./washbasinsShop";

// Filters for the public bathrooms catalog. Products are entirely DB-backed
// (added through the admin dashboard) — see getDbProducts in products.ts.
// "series" and "shape" only apply to urinals; separators fit every series.
export const publicBathroomsShop: CatalogEntry = {
  filters: [
    {
      id: "type",
      label: "Type",
      options: ["Urinals", "Urinal Separators"],
    },
    {
      id: "series",
      label: "Series",
      options: ["Taurus", "Urion"],
    },
    {
      id: "shape",
      label: "Shape",
      options: ["Circular", "Rectangular"],
    },
  ],
  products: [],
};
