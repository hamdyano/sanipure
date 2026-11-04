import type { CatalogEntry } from "./washbasinsShop";

// Filters for the concealed flush tank catalog. Products are entirely
// DB-backed (added through the admin dashboard) — see getDbProducts in
// products.ts. "color" and "shape" only apply to actuators.
export const concealedFlushTankShop: CatalogEntry = {
  filters: [
    {
      id: "type",
      label: "Type",
      options: ["Flush Tank", "Actuator"],
    },
    {
      id: "color",
      label: "Actuator Color",
      options: ["White", "Matte Black", "Chrome", "Matte Chrome"],
    },
    {
      id: "shape",
      label: "Actuator Shape",
      options: ["Round", "Square"],
    },
  ],
  products: [],
};
