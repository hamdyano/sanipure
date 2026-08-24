export interface CatalogFilter {
  id: string;
  label: string;
  options: string[];
}

export interface CatalogEntry {
  filters: CatalogFilter[];
  products: Record<string, string | string[]>[];
}

// Filters for the washbasins catalog. Products are entirely DB-backed now
// (added through the admin dashboard) — see getDbProducts in products.ts.
export const washbasinsShop: CatalogEntry = {
  filters: [
    {
      id: "material",
      label: "Material",
      options: ["Ceramic", "Composite"],
    },
    {
      id: "shape",
      label: "Shape",
      options: ["Edge", "Round", "with side"],
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
      options: ["Kepler", "Titan", "Magnus", "Vega", "Libra", "Rossetta", "Flora", "Furniture", "Kitchen"],
    },
    {
      id: "size",
      label: "Size",
      options: ["105", "90", "85", "80", "75", "70", "65", "60", "50", "45"],
    },
    {
      id: "type",
      label: "Type",
      options: [
        "Stand alone",
        "Furniture",
        "pedestal",
        "half pedestal",
        "tap hole",
        "over counter",
        "counter top",
        "under counter",
        "wall hung",
      ],
    },
  ],
  products: [],
};
