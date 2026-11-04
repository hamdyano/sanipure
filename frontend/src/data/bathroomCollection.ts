import floraCover from "../assets/bathroom collection photos/flora/cover.jpg";
import floraCloseCoupledToilet from "../assets/bathroom collection photos/flora/close coupled toilet.jpg";
import keplerCover from "../assets/bathroom collection photos/kepler/cover.jpg";
import keplerAboveCounter from "../assets/bathroom collection photos/kepler/above counter washbasin.jpg";
import keplerFurniture from "../assets/bathroom collection photos/kepler/furniture washbasin.jpg";
import keplerPedestal from "../assets/bathroom collection photos/kepler/pedestal washbasin.jpg";
import keplerHalfPedestal from "../assets/bathroom collection photos/kepler/half pedestal washbasin.jpg";
import keplerCloseCoupledToilet from "../assets/bathroom collection photos/kepler/close coupled toilet.jpg";
import keplerWallHungToilet from "../assets/bathroom collection photos/kepler/wall hung toilet.jpg";
import libraCover from "../assets/bathroom collection photos/libra/cover.jpg";
import magnusFloorStandingWashbasin from "../assets/bathroom collection photos/magnus/floor standing washbasin.jpg";
import magnusWallMountedWashbasin from "../assets/bathroom collection photos/magnus/wall mounted washbasin.jpg";
import magnusFloorStandingToilet from "../assets/bathroom collection photos/magnus/floor standing toilet.jpg";
import magnusWallHungToilet from "../assets/bathroom collection photos/magnus/wall hung toilet.jpg";
import magnusWallHungBidet from "../assets/bathroom collection photos/magnus/wall hung bidet.jpg";
import magnusBlack from "../assets/bathroom collection photos/magnus/black collection.jpg";
import rosettaPedestal from "../assets/bathroom collection photos/rosetta/pedestal washbasin.jpg";
import rosettaHalfPedestal from "../assets/bathroom collection photos/rosetta/half pedestal washbasin.jpg";
import rosettaCloseCoupledToilet from "../assets/bathroom collection photos/rosetta/close coupled toilet.jpg";
import rosettaWallHungToilet from "../assets/bathroom collection photos/rosetta/wall hung toilet.jpg";
import rosettaBackToWallToilet from "../assets/bathroom collection photos/rosetta/back to wall toilet.jpg";
import rosettaCombiToilet from "../assets/bathroom collection photos/rosetta/combi toilet.jpg";
import titanCover from "../assets/bathroom collection photos/titan/cover.jpg";
import titanAboveCounter from "../assets/bathroom collection photos/titan/above counter washbasin.jpg";
import titanRoundAboveCounter from "../assets/bathroom collection photos/titan/round above counter washbasin.jpg";
import titanFurniture from "../assets/bathroom collection photos/titan/furniture washbasin.jpg";
import titanPedestal from "../assets/bathroom collection photos/titan/pedestal washbasin.jpg";
import titanHalfPedestal from "../assets/bathroom collection photos/titan/half pedestal washbasin.jpg";
import titanCloseCoupledToilet from "../assets/bathroom collection photos/titan/close coupled toilet.jpg";
import titanWallHungToilet from "../assets/bathroom collection photos/titan/wall hung toilet.jpg";
import vegaAboveCounter from "../assets/bathroom collection photos/vega/above counter washbasin.jpg";
import vegaPedestal from "../assets/bathroom collection photos/vega/pedestal washbasin.jpg";
import vegaHalfPedestal from "../assets/bathroom collection photos/vega/half pedestal washbasin.jpg";
import vegaToiletAndBidet from "../assets/bathroom collection photos/vega/toilet and bidet.jpg";
import vegaCalacattaSet from "../assets/bathroom collection photos/vega/calacatta set.jpg";
import vegaMattePlatinumSet from "../assets/bathroom collection photos/vega/matte platinum set.jpg";
import vegaPlatinumSet from "../assets/bathroom collection photos/vega/platinum set.jpg";
import vegaWallHungBidet from "../assets/bathroom collection photos/hero section.jpg";

export type PieceGroup = "Washbasin" | "Toilet" | "Bidet" | "Set";

export interface SeriesPiece {
  name: string;
  group: PieceGroup;
  image: string;
  /** In cm, as listed on the old website. */
  sizes?: string[];
  colors?: string[];
  features?: string[];
  /** Short line for pieces that are a finish or a set rather than a shape. */
  note?: string;
}

export interface CollectionSeries {
  id: string;
  name: string;
  description: string;
  cover: string;
  pieces: SeriesPiece[];
}

/** Swatch colours for the glazes named on the pieces below. */
export const GLAZE_COLORS: Record<string, string> = {
  White: "#ffffff",
  Pergamon: "#e9dfc9",
  Black: "#151515",
};

// The Bathroom Collection page's series, pieces, wording and photos, taken
// from the old website's "Series" category (sanipure-eg.com, path=97).
export const BATHROOM_SERIES: CollectionSeries[] = [
  {
    id: "flora",
    name: "Flora",
    description:
      "Flora was designed to meet your basic needs consistently with its durable and long-lasting quality. Let Flora's timeless and effortless style shine through in your bathroom.",
    cover: floraCover,
    pieces: [
      {
        name: "Pedestal Washbasin",
        group: "Washbasin",
        image: floraCover,
        sizes: ["60"],
        colors: ["White", "Pergamon"],
      },
      {
        name: "Close-Coupled Toilet",
        group: "Toilet",
        image: floraCloseCoupledToilet,
        colors: ["White", "Pergamon"],
      },
    ],
  },
  {
    id: "kepler",
    name: "Kepler",
    description:
      "Boldness has been the keyword for creating Kepler. An edged yet flowy design blends Kepler well into the space it is placed. Mixing sleek contemporary design elements with our exceptional know-how, we've balanced the reliability of classical sanitaryware with boldness and innovation… our signature.",
    cover: keplerCover,
    pieces: [
      {
        name: "Above-Counter Washbasin",
        group: "Washbasin",
        image: keplerAboveCounter,
        sizes: ["80 × 49", "70 × 49", "60 × 47", "50 × 47"],
        colors: ["White", "Pergamon", "Black"],
      },
      {
        name: "Furniture Washbasin",
        group: "Washbasin",
        image: keplerFurniture,
        sizes: ["90 × 49"],
      },
      {
        name: "Pedestal Washbasin",
        group: "Washbasin",
        image: keplerPedestal,
        sizes: ["70 × 49"],
      },
      {
        name: "Half-Pedestal Washbasin",
        group: "Washbasin",
        image: keplerHalfPedestal,
        sizes: ["80 × 49", "70 × 49"],
      },
      {
        name: "Close-Coupled Toilet",
        group: "Toilet",
        image: keplerCloseCoupledToilet,
        sizes: ["65 × 40"],
        colors: ["White", "Pergamon"],
        features: ["HydroJet"],
      },
      {
        name: "Wall-Hung Toilet",
        group: "Toilet",
        image: keplerWallHungToilet,
        sizes: ["54 × 40"],
        colors: ["White", "Pergamon", "Black"],
        features: ["HydroJet"],
      },
    ],
  },
  {
    id: "libra",
    name: "Libra",
    description:
      "Inspired by the harmony and elegance of the Libra sign, Libra brings balance to your bathroom design. With its sleek contours and perfectly symmetrical structure, it is a testament to both functionality and aesthetics.",
    cover: libraCover,
    pieces: [
      {
        name: "Toilet & Pedestal Washbasin",
        group: "Set",
        image: libraCover,
        colors: ["White", "Pergamon"],
        note: "Floor-standing toilet with a matching pedestal washbasin.",
      },
    ],
  },
  {
    id: "magnus",
    name: "Magnus",
    description:
      "Smart sanitaryware with modern features. Magnus brings advanced HydroJet technology for water saving, soft-close seats and a rimless design for easier cleaning, combining comfort and elegance. Also available in a striking matte-black finish.",
    cover: magnusWallHungToilet,
    pieces: [
      {
        name: "Floor-Standing Washbasin",
        group: "Washbasin",
        image: magnusFloorStandingWashbasin,
        sizes: ["60"],
      },
      {
        name: "Wall-Mounted Washbasin",
        group: "Washbasin",
        image: magnusWallMountedWashbasin,
        sizes: ["60"],
      },
      {
        name: "Floor-Standing Toilet with Tank",
        group: "Toilet",
        image: magnusFloorStandingToilet,
        sizes: ["65 × 36"],
        colors: ["White", "Pergamon"],
        features: ["HydroJet", "Rimless", "Soft Close"],
      },
      {
        name: "Wall-Hung Toilet",
        group: "Toilet",
        image: magnusWallHungToilet,
        sizes: ["54 × 40"],
        features: ["HydroJet", "Rimless", "Soft Close"],
      },
      {
        name: "Wall-Hung Bidet",
        group: "Bidet",
        image: magnusWallHungBidet,
        sizes: ["54 × 36"],
        colors: ["White", "Pergamon"],
      },
      {
        name: "Magnus Black",
        group: "Set",
        image: magnusBlack,
        colors: ["Black"],
        note: "The Magnus collection in a matte-black finish.",
      },
    ],
  },
  {
    id: "rosetta",
    name: "Rosetta",
    description:
      "Asserting a superior standard, our Rosetta series is intricate yet subtle. With its unassuming air of simplicity, Rosetta is an instant classic. The standard being set is not exclusive to its design; its durability plays a vital role in establishing it as a timeless selection.",
    cover: rosettaPedestal,
    pieces: [
      {
        name: "Pedestal Washbasin",
        group: "Washbasin",
        image: rosettaPedestal,
        sizes: ["60 × 48", "55 × 44"],
      },
      {
        name: "Half-Pedestal Washbasin",
        group: "Washbasin",
        image: rosettaHalfPedestal,
        sizes: ["45 × 36.5"],
      },
      {
        name: "Close-Coupled Toilet",
        group: "Toilet",
        image: rosettaCloseCoupledToilet,
        sizes: ["61 × 36"],
        colors: ["White", "Pergamon"],
        features: ["HydroJet"],
      },
      {
        name: "Wall-Hung Toilet",
        group: "Toilet",
        image: rosettaWallHungToilet,
        colors: ["White", "Pergamon"],
      },
      {
        name: "Back-to-Wall Toilet",
        group: "Toilet",
        image: rosettaBackToWallToilet,
        colors: ["White", "Pergamon"],
      },
      {
        name: "Combi Toilet",
        group: "Toilet",
        image: rosettaCombiToilet,
      },
    ],
  },
  {
    id: "titan",
    name: "Titan",
    description:
      "Focusing on intelligent design that merges practicality and the spirit of the age through its loose yet ergonomic lines, Titan stands tall and steady wherever it is placed.",
    cover: titanCover,
    pieces: [
      {
        name: "Above-Counter Washbasin",
        group: "Washbasin",
        image: titanAboveCounter,
        sizes: ["80 × 40", "60 × 40"],
        colors: ["White", "Black"],
      },
      {
        name: "Round Above-Counter Washbasin",
        group: "Washbasin",
        image: titanRoundAboveCounter,
        sizes: ["Ø 48"],
        colors: ["White", "Black"],
      },
      {
        name: "Furniture Washbasin",
        group: "Washbasin",
        image: titanFurniture,
        sizes: ["105 × 55", "85 × 55"],
        colors: ["White", "Pergamon"],
      },
      {
        name: "Pedestal Washbasin",
        group: "Washbasin",
        image: titanPedestal,
        sizes: ["80 × 50", "70 × 50"],
      },
      {
        name: "Half-Pedestal Washbasin",
        group: "Washbasin",
        image: titanHalfPedestal,
        sizes: ["80 × 50", "70 × 50"],
      },
      {
        name: "Close-Coupled Toilet",
        group: "Toilet",
        image: titanCloseCoupledToilet,
        sizes: ["65 × 40"],
        colors: ["White", "Pergamon"],
        features: ["HydroJet"],
      },
      {
        name: "Wall-Hung Toilet",
        group: "Toilet",
        image: titanWallHungToilet,
        sizes: ["54 × 40"],
        colors: ["White", "Pergamon", "Black"],
        features: ["HydroJet"],
      },
    ],
  },
  {
    id: "vega",
    name: "Vega",
    description:
      "Vega has everything you need to create the perfect sanctuary in your home, with options ranging from toilets and washbasins to bidets and complete bathroom sets. Every piece is designed with durability and quality in mind, so you can trust Vega to help you create the perfect bathroom.",
    cover: vegaCalacattaSet,
    pieces: [
      {
        name: "Above-Counter Washbasin",
        group: "Washbasin",
        image: vegaAboveCounter,
        colors: ["White", "Pergamon"],
      },
      {
        name: "Pedestal Washbasin",
        group: "Washbasin",
        image: vegaPedestal,
      },
      {
        name: "Half-Pedestal Washbasin",
        group: "Washbasin",
        image: vegaHalfPedestal,
      },
      {
        name: "Close-Coupled Toilet & Bidet",
        group: "Toilet",
        image: vegaToiletAndBidet,
        colors: ["White", "Pergamon"],
      },
      {
        name: "Wall-Hung Bidet",
        group: "Bidet",
        image: vegaWallHungBidet,
        colors: ["White", "Pergamon"],
      },
      {
        name: "Calacatta Bathroom Set",
        group: "Set",
        image: vegaCalacattaSet,
        note: "The bold veins of natural marble, paired with minimalist modern lines.",
      },
      {
        name: "Matte Platinum Bathroom Set",
        group: "Set",
        image: vegaMattePlatinumSet,
        note: "A smooth, refined matte texture that sits quietly in modern interiors.",
      },
      {
        name: "Platinum Bathroom Set",
        group: "Set",
        image: vegaPlatinumSet,
        note: "A high-gloss finish that brings brilliance to every detail.",
      },
    ],
  },
];
