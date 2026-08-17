import express from "express";
import cors from "cors";
import path from "path";





const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
      origin: "http://localhost:5173", // Frontend origin
      credentials: true, // Allow credentials (cookies) to be sent
    })
  );

  

app.use(express.static(path.join(__dirname, "../../frontend/dist")));


app.get("/api/test", async (req, res) => {
  res.json({ message: "Test successful!" });
});

// Stub product catalog, keyed by category slug. Replace with real
// DB-backed data once the product schema/API is built.
const productCatalog: Record<
  string,
  {
    filters: { id: string; label: string; options: string[] }[];
    products: Record<string, string | string[]>[];
  }
> = {
  bathtubs: {
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
  },
  washbasins: {
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
  },
  toilets: {
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
  },
};

app.get("/api/products", async (req, res) => {
  const category = String(req.query.category || "");
  const catalog = productCatalog[category];
  if (!catalog) {
    res.status(404).json({ message: `No catalog for category "${category}"` });
    return;
  }
  res.json({ category, ...catalog });
});

// SPA fallback: any non-API route should load the React app, which then
// handles routing (e.g. /products/washbasins) on the client via React Router.
app.get(/^\/(?!api\/).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});