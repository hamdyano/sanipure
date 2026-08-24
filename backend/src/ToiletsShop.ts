import type { CatalogEntry } from "./washbasinsShop";

// Filters for the toilets catalog. Products are entirely DB-backed now
// (added through the admin dashboard) — see getDbProducts in products.ts.
export const toiletsShop: CatalogEntry = {
  filters: [
    {
      id: "shape",
      label: "Shape",
      options: ["Square", "Round", "with Bidet"],
    },
    {
      id: "color",
      label: "Colors",
      options: [
        "White",
        "Pergamon",
        "Black",
        "Calacatta",
        "Platinum",
        "Matte Platinum",
        "Sabbia",
        "Concrete",
        "Salvia",
        "Terracotta",
      ],
    },
    {
      id: "series",
      label: "Series",
      options: ["Kepler", "Titan", "Magnus", "Vega", "Libra", "Rossetta", "Flora"],
    },
    {
      id: "type",
      label: "Type",
      options: ["Back to wall", "Floor Standing", "Mini", "Wall hung", "Combi"],
    },
    {
      id: "extra",
      label: "Extra",
      options: ["Soft close", "Hydro jet", "Sani Swirle"],
    },
  ],
  products: [],
};
