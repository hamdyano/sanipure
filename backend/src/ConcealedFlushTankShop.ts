import type { CatalogEntry } from "./washbasinsShop";

// Filters for the concealed flush tank catalog. Products are entirely
// DB-backed (added through the admin dashboard) — see getDbProducts in
// products.ts.
export const concealedFlushTankShop: CatalogEntry = {
  filters: [
    {
      id: "installation",
      label: "Installation",
      options: ["Wall-Hung Frame", "Back-to-Wall", "Low-Height Frame", "Brick-In"],
    },
    {
      id: "mechanism",
      label: "Flush Mechanism",
      options: ["Mechanical", "Pneumatic", "Sensor"],
    },
    {
      id: "flush",
      label: "Flush Type",
      options: ["Dual Flush", "Single Flush"],
    },
  ],
  products: [],
};
