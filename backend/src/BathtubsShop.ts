import type { CatalogEntry } from "./washbasinsShop";

// Filters for the bathtubs catalog. Products are entirely DB-backed now
// (added through the admin dashboard) — see getDbProducts in products.ts.
export const bathtubsShop: CatalogEntry = {
  filters: [
    {
      id: "material",
      label: "Material",
      options: ["Acrylic", "Composite"],
    },
    {
      id: "shape",
      label: "Shape",
      options: ["Edge", "Round"],
    },
    {
      id: "color",
      label: "Colors",
      options: ["White", "Pergamon", "Color", "Pattern"],
    },
    {
      id: "series",
      label: "Series",
      options: ["Panel Tub", "Seamless Tub", "Panel Tray", "Tray"],
    },
    {
      id: "type",
      label: "Type",
      options: ["Back to wall", "Stand Alone", "Corner"],
    },
    {
      id: "extra",
      label: "Extra",
      options: ["Massage", "Head rest", "Grap holder", "Anti slip", "Waste cover"],
    },
  ],
  products: [],
};
