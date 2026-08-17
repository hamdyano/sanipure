import type { CatalogEntry } from "./washbasinsShop";

// Stub toilets catalog. Replace with real DB-backed data once the
// product schema/API is built.
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
  products: [
    { id: "t1", name: "Kepler Wall Hung", series: "Kepler", type: "Wall hung", shape: "Round", color: "White", extra: ["Soft close", "Hydro jet"] },
    { id: "t2", name: "Kepler Wall Hung", series: "Kepler", type: "Wall hung", shape: "Round", color: "Pergamon", extra: ["Soft close"] },
    { id: "t3", name: "Titan Floor Standing", series: "Titan", type: "Floor Standing", shape: "Square", color: "Black", extra: ["Soft close"] },
    { id: "t4", name: "Titan Floor Standing", series: "Titan", type: "Floor Standing", shape: "Square", color: "Salvia", extra: [] },
    { id: "t5", name: "Magnus Back to Wall", series: "Magnus", type: "Back to wall", shape: "with Bidet", color: "Calacatta", extra: ["Hydro jet", "Sani Swirle"] },
    { id: "t6", name: "Magnus Back to Wall", series: "Magnus", type: "Back to wall", shape: "with Bidet", color: "Terracotta", extra: ["Hydro jet"] },
    { id: "t7", name: "Vega Mini", series: "Vega", type: "Mini", shape: "Round", color: "Platinum", extra: [] },
    { id: "t8", name: "Libra Combi", series: "Libra", type: "Combi", shape: "Square", color: "Matte Platinum", extra: ["Soft close", "Sani Swirle"] },
    { id: "t9", name: "Rossetta Wall Hung", series: "Rossetta", type: "Wall hung", shape: "with Bidet", color: "Sabbia", extra: ["Sani Swirle"] },
    { id: "t10", name: "Flora Floor Standing", series: "Flora", type: "Floor Standing", shape: "Round", color: "Concrete", extra: [] },
  ],
};
