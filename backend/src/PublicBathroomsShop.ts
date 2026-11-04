import type { CatalogEntry } from "./washbasinsShop";

// Filters for the public bathrooms catalog. Products are entirely DB-backed
// (added through the admin dashboard) — see getDbProducts in products.ts.
export const publicBathroomsShop: CatalogEntry = {
  filters: [
    {
      id: "shape",
      label: "Shape",
      options: ["Circular", "Rectangular"],
    },
  ],
  products: [],
};
