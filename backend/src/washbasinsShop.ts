export interface CatalogFilter {
  id: string;
  label: string;
  options: string[];
}

export interface CatalogEntry {
  filters: CatalogFilter[];
  products: Record<string, string | string[]>[];
}

// Stub washbasins catalog. Replace with real DB-backed data once the
// product schema/API is built.
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
  products: [
    { id: "w1", name: "Kepler Stand Alone", series: "Kepler", type: "Stand alone", material: "Ceramic", shape: "Edge", color: "White", size: "105" },
    { id: "w2", name: "Kepler Stand Alone", series: "Kepler", type: "Stand alone", material: "Composite", shape: "Round", color: "Terracotta", size: "45" },
    { id: "w3", name: "Titan Furniture", series: "Titan", type: "Furniture", material: "Composite", shape: "Round", color: "Pergamon", size: "90" },
    { id: "w4", name: "Magnus Pedestal", series: "Magnus", type: "pedestal", material: "Ceramic", shape: "with side", color: "Black", size: "85" },
    { id: "w5", name: "Vega Half Pedestal", series: "Vega", type: "half pedestal", material: "Composite", shape: "Edge", color: "Calacatta", size: "80" },
    { id: "w6", name: "Libra Tap Hole", series: "Libra", type: "tap hole", material: "Ceramic", shape: "Round", color: "Platinum", size: "75" },
    { id: "w7", name: "Rossetta Over Counter", series: "Rossetta", type: "over counter", material: "Composite", shape: "with side", color: "Matte Platinum", size: "70" },
    { id: "w8", name: "Flora Counter Top", series: "Flora", type: "counter top", material: "Ceramic", shape: "Edge", color: "Sabbia", size: "65" },
    { id: "w9", name: "Furniture Under Counter", series: "Furniture", type: "under counter", material: "Composite", shape: "Round", color: "Concrete", size: "60" },
    { id: "w10", name: "Kitchen Wall Hung", series: "Kitchen", type: "wall hung", material: "Ceramic", shape: "with side", color: "Salvia", size: "50" },
  ],
};
