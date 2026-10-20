import factoryImage from "../assets/who we are photos/factory 3.jpg";
import finishesImage from "../assets/toilets shop photos/hero section.jpg";
import article1 from "../assets/articles photos/article 1.jpg";
import article2 from "../assets/articles photos/article 2.jpg";
import article3 from "../assets/articles photos/article 3.jpg";
import article4 from "../assets/articles photos/article 4.jpg";
import washbasinGuideImage from "../assets/washbasins shop photos/Libra.jpg";
import concealedTankImage from "../assets/categories photos/Concealed Flush tank.jpeg";
import toiletGuideImage from "../assets/toilets shop photos/Titan Wall Mounted.jpg";
import bathtubGuideImage from "../assets/bathtubs shop photos/Halo.jpg";
import careGuideImage from "../assets/washbasins shop photos/Harmony.jpg";
import furnitureImage from "../assets/furniture photos/vanity-units.jpg";

export interface NewsArticle {
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  body: string[];
}

// Newest first. The four design articles keep the slugs the homepage's
// Articles section already links to (/news/<slug>).
export const newsArticles: NewsArticle[] = [
  {
    slug: "inside-the-sanipure-factory",
    category: "Inside Sanipure",
    date: "October 6, 2026",
    title: "Inside the Sanipure Factory",
    excerpt:
      "From raw material to the finished piece in your bathroom — a look at the people, machines, and checks behind every Sanipure product.",
    image: factoryImage,
    body: [
      "Every washbasin, toilet, and bathtub that carries the Sanipure name starts its life on our factory floor. Before a product ever reaches a showroom, it passes through forming, finishing, and a series of quality checks carried out by a team that knows each piece by hand.",
      "Machines handle the heavy, repetitive work with precision, but people make the decisions that matter: whether a surface is smooth enough, whether a glaze is even, whether a piece is ready to move on. Anything that doesn't meet the standard is pulled from the line.",
      "That combination of modern production and careful handwork is what lets us offer premium sanitaryware that looks right on day one and keeps performing for years.",
    ],
  },
  {
    slug: "ten-finishes-for-every-bathroom",
    category: "Collections",
    date: "September 15, 2026",
    title: "Ten Finishes for Every Bathroom",
    excerpt:
      "Classic White, bold Black, warm Terracotta, and soft Salvia — our colour range lets you design a bathroom that feels like yours.",
    image: finishesImage,
    body: [
      "White will always be a classic, but a bathroom doesn't have to stop there. Our toilet range is available in ten colours and finishes: White, Pergamon, Black, Calacatta, Platinum, Matte Platinum, Sabbia, Concrete, Salvia, and Terracotta.",
      "Warm tones like Sabbia and Terracotta pair beautifully with wood and natural stone. Calacatta brings the look of marble to a single statement piece, while Concrete and Matte Platinum suit industrial and minimalist interiors.",
      "Mixing finishes is the easiest way to give a bathroom personality — try a coloured toilet against neutral walls, or match a finish to your tiles for a seamless, tone-on-tone look.",
    ],
  },
  {
    slug: "modern-black-bathroom-design",
    category: "Design Ideas",
    date: "July 24, 2026",
    title: "Modern Black Bathroom Design",
    excerpt:
      "Sleek dark tiles and floating fixtures for a bold, contemporary look.",
    image: article1,
    body: [
      "A black bathroom makes a confident statement. Dark tiles and walls create depth and drama, and they turn white or metallic fittings into the focal point of the room.",
      "Wall-hung toilets and floating vanities are a natural fit: lifting fixtures off the floor keeps a dark room from feeling heavy and makes cleaning easier.",
      "Layered lighting is essential. Combine a warm overhead light with soft mirror lighting so the space feels moody rather than dim.",
    ],
  },
  {
    slug: "spa-like-bathroom-ideas",
    category: "Design Ideas",
    date: "July 24, 2026",
    title: "Spa-Like Bathroom Ideas",
    excerpt:
      "Warm wood, natural stone, and calm tones to bring spa comfort home.",
    image: article2,
    body: [
      "The secret to a spa bathroom is calm. Start with a restrained palette of warm neutrals, then add natural textures like wood, stone, and linen.",
      "A freestanding bathtub instantly sets the tone, turning the bathroom into a place to relax rather than just get ready.",
      "Finish with soft, indirect lighting, a few plants, and clutter-free storage so every surface feels open and peaceful.",
    ],
  },
  {
    slug: "minimalist-bathroom-design",
    category: "Design Ideas",
    date: "July 24, 2026",
    title: "Minimalist Bathroom Design",
    excerpt:
      "Clean lines and quiet palettes that let quality fittings stand out.",
    image: article3,
    body: [
      "Minimalism is about choosing fewer things and choosing them well. In the bathroom, that means simple shapes, hidden storage, and fittings with clean, precise lines.",
      "Concealed flush tanks and wall-mounted pieces remove visual clutter, leaving smooth walls and open floor space.",
      "With so little in the room, quality shows. A well-made washbasin or toilet becomes the design itself.",
    ],
  },
  {
    slug: "stone-wood-bathroom-trends",
    category: "Design Ideas",
    date: "July 24, 2026",
    title: "Stone & Wood Bathroom Trends",
    excerpt:
      "Textured stone walls paired with warm wood vanities for depth.",
    image: article4,
    body: [
      "Stone and wood are one of the most enduring pairings in interior design. The cool, textured surface of stone balances the warmth and grain of wood.",
      "Try a stone feature wall behind the washbasin with a timber vanity beneath it, or bring wood in through shelving and accessories.",
      "Soft white or earthy-toned sanitaryware ties the look together without competing with the natural materials around it.",
    ],
  },
];

// Older stories, shown in the "Old News" grid under the News page's slider
// rather than in the slider itself. Newest first.
export const oldNewsArticles: NewsArticle[] = [
  {
    slug: "choosing-the-right-washbasin",
    category: "Guides",
    date: "June 18, 2026",
    title: "Choosing the Right Washbasin",
    excerpt:
      "Counter-top, wall-hung, pedestal or furniture — how to pick the washbasin that fits your space and the way you use it.",
    image: washbasinGuideImage,
    body: [
      "The right washbasin starts with how it's mounted. Counter-top and over-counter basins sit on a vanity and make a statement; under-counter basins tuck beneath the worktop for an easy-to-wipe surface; wall-hung basins keep the floor clear in smaller rooms.",
      "Pedestal and half-pedestal basins hide the pipework while keeping a classic look, and furniture basins come with storage built in — ideal when every centimetre counts.",
      "Then choose your size and material. Our range runs from compact 45 cm basins for guest bathrooms up to generous 105 cm models, in ceramic or composite, so there's a fit for every wall.",
    ],
  },
  {
    slug: "why-concealed-flush-tanks-save-space",
    category: "Products",
    date: "May 27, 2026",
    title: "Why Concealed Flush Tanks Save Space",
    excerpt:
      "Hiding the cistern inside the wall gives you a cleaner look, quieter flushing and more room to move.",
    image: concealedTankImage,
    body: [
      "A concealed flush tank sits inside the wall, behind a slim flush plate. With the cistern out of sight, the toilet takes up less depth and the bathroom instantly looks calmer and more open.",
      "Because the tank is enclosed, flushing is quieter, and there are fewer corners and joints to clean. It pairs naturally with wall-hung toilets, lifting the whole fixture off the floor.",
      "It's one of the simplest ways to give a bathroom a modern, built-in finish — whether you're renovating or starting from scratch.",
    ],
  },
  {
    slug: "wall-hung-or-floor-standing-toilets",
    category: "Guides",
    date: "April 9, 2026",
    title: "Wall-Hung or Floor-Standing?",
    excerpt:
      "A quick guide to toilet styles — from wall-hung and back-to-wall to close-coupled — and which suits your bathroom.",
    image: toiletGuideImage,
    body: [
      "Wall-hung toilets are fixed to the wall with the cistern hidden behind it. They make cleaning the floor easy and help small bathrooms feel larger.",
      "Back-to-wall toilets stand on the floor but sit flush against the wall, hiding pipework for a neat look without a wall-mounted frame. Close-coupled and floor-standing models are the most straightforward to install and replace.",
      "Whichever you choose, look at the extras too: a soft-close seat stops slamming, and a built-in hygiene douche adds everyday comfort.",
    ],
  },
  {
    slug: "panel-seamless-or-freestanding-bathtubs",
    category: "Guides",
    date: "February 23, 2026",
    title: "Panel, Seamless or Freestanding?",
    excerpt:
      "How to choose a bathtub that suits your layout — and when a shower tray is the better fit.",
    image: bathtubGuideImage,
    body: [
      "Panel bathtubs are fitted against one or more walls and finished with a front panel — a practical, space-efficient choice for most family bathrooms.",
      "Seamless bathtubs have smooth, uninterrupted sides for a sleek, contemporary look, while freestanding bathtubs become the centrepiece of the room when you have the space around them.",
      "If the bathroom is tight or you prefer showers, a shower tray gives you a low, easy-to-step-into base and frees up floor space.",
    ],
  },
  {
    slug: "caring-for-your-sanitaryware",
    category: "Care & Maintenance",
    date: "December 11, 2025",
    title: "Caring for Your Sanitaryware",
    excerpt:
      "Simple habits that keep washbasins, toilets and bathtubs looking new for years.",
    image: careGuideImage,
    body: [
      "Glazed ceramic is hard-wearing and easy to clean. For everyday care, a soft cloth with warm water and a mild detergent is all it needs.",
      "Avoid abrasive powders, scouring pads and harsh acids, which can dull the glaze or damage coloured and matte finishes over time. Rinse well and wipe dry to prevent limescale marks in hard-water areas.",
      "For fittings and flush plates, the same gentle approach applies — a little care regularly is better than heavy cleaning occasionally.",
    ],
  },
  {
    slug: "bathroom-furniture-that-works-hard",
    category: "Design Ideas",
    date: "October 30, 2025",
    title: "Bathroom Furniture That Works Hard",
    excerpt:
      "Vanity units, tall cabinets and open shelves that keep the bathroom tidy without losing style.",
    image: furnitureImage,
    body: [
      "A vanity unit built around your washbasin keeps essentials hidden and the counter clear. Wall-hung units leave the floor open, so smaller bathrooms feel larger and are easier to clean.",
      "Tall units use the height of the wall for towels and spares, and placed beside the vanity they frame the washbasin area neatly.",
      "Mix closed storage with a few open shelves for everyday items, and add warmth with wood, baskets or plants to make the room feel personal.",
    ],
  },
];

export const getNewsArticle = (slug: string) =>
  [...newsArticles, ...oldNewsArticles].find((article) => article.slug === slug);
