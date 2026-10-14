import factoryImage from "../assets/who we are photos/factory 3.jpg";
import finishesImage from "../assets/toilets shop photos/hero section.jpg";
import article1 from "../assets/articles photos/article 1.jpg";
import article2 from "../assets/articles photos/article 2.jpg";
import article3 from "../assets/articles photos/article 3.jpg";
import article4 from "../assets/articles photos/article 4.jpg";

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

export const getNewsArticle = (slug: string) =>
  newsArticles.find((article) => article.slug === slug);
