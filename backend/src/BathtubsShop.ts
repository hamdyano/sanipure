import type { CatalogEntry } from "./washbasinsShop";

// Stub bathtubs catalog. Replace with real DB-backed data once the
// product schema/API is built.
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
  products: [
    { id: "b1", name: "Panel Tub Back to Wall", series: "Panel Tub", type: "Back to wall", material: "Acrylic", shape: "Edge", color: "White", extra: ["Massage", "Head rest"] },
    { id: "b2", name: "Panel Tub Stand Alone", series: "Panel Tub", type: "Stand Alone", material: "Composite", shape: "Round", color: "Pergamon", extra: ["Anti slip"] },
    { id: "b3", name: "Seamless Tub Corner", series: "Seamless Tub", type: "Corner", material: "Acrylic", shape: "Round", color: "Color", extra: ["Waste cover"] },
    { id: "b4", name: "Seamless Tub Back to Wall", series: "Seamless Tub", type: "Back to wall", material: "Composite", shape: "Edge", color: "Pattern", extra: ["Grap holder", "Massage"] },
    { id: "b5", name: "Panel Tray Stand Alone", series: "Panel Tray", type: "Stand Alone", material: "Acrylic", shape: "Edge", color: "White", extra: [] },
    { id: "b6", name: "Panel Tray Corner", series: "Panel Tray", type: "Corner", material: "Composite", shape: "Round", color: "Pergamon", extra: ["Head rest"] },
    { id: "b7", name: "Tray Back to Wall", series: "Tray", type: "Back to wall", material: "Acrylic", shape: "Round", color: "Color", extra: ["Anti slip", "Waste cover"] },
    { id: "b8", name: "Tray Stand Alone", series: "Tray", type: "Stand Alone", material: "Composite", shape: "Edge", color: "Pattern", extra: ["Grap holder"] },
    { id: "b9", name: "Panel Tub Corner", series: "Panel Tub", type: "Corner", material: "Acrylic", shape: "Round", color: "White", extra: ["Head rest", "Grap holder"] },
    { id: "b10", name: "Seamless Tub Back to Wall", series: "Seamless Tub", type: "Back to wall", material: "Composite", shape: "Edge", color: "Color", extra: ["Massage", "Anti slip", "Waste cover"] },
  ],
};
