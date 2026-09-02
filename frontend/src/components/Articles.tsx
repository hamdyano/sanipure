import { Link } from "react-router-dom";
import RevealSection from "./shared/RevealSection";
import DirectionalReveal from "./shared/DirectionalReveal";
import article1 from "../assets/articles photos/article 1.jpg";
import article2 from "../assets/articles photos/article 2.jpg";
import article3 from "../assets/articles photos/article 3.jpg";
import article4 from "../assets/articles photos/article 4.jpg";

const articles = [
  {
    title: "Modern Black Bathroom Design",
    excerpt:
      "Sleek dark tiles and floating fixtures for a bold, contemporary look.",
    image: article1,
    to: "/news/modern-black-bathroom-design",
  },
  {
    title: "Spa-Like Bathroom Ideas",
    excerpt:
      "Warm wood, natural stone, and calm tones to bring spa comfort home.",
    image: article2,
    to: "/news/spa-like-bathroom-ideas",
  },
  {
    title: "Minimalist Bathroom Design",
    excerpt:
      "Clean lines and quiet palettes that let quality fittings stand out.",
    image: article3,
    to: "/news/minimalist-bathroom-design",
  },
  {
    title: "Stone & Wood Bathroom Trends",
    excerpt:
      "Textured stone walls paired with warm wood vanities for depth.",
    image: article4,
    to: "/news/stone-wood-bathroom-trends",
  },
];

const date = "July 24, 2026";

// "Read More" buttons throughout this section share a distinctive
// ticket-stub look: straight horizontal borders top/bottom, with the two
// vertical edges replaced by short skewed bars so they read as diagonal
// slashes instead of a plain rectangle.
const slashButtonClasses =
  "relative inline-flex items-center justify-center border-y border-current px-6 py-2.5 font-brand text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-70 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:-skew-x-[20deg] before:bg-current before:content-[''] after:absolute after:right-0 after:top-0 after:h-full after:w-px after:-skew-x-[20deg] after:bg-current after:content-['']";

// Outer cards slide in from their nearer edge, inner cards rise from below.
const cardDirections: Array<"left" | "right" | "up"> = [
  "left",
  "up",
  "up",
  "right",
];

const Articles = () => {
  return (
    <section className="mb-32 md:mb-44">
      <RevealSection className="bg-[#3a3a3a] px-6 py-10 md:px-16 md:py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-2 justify-self-start">
            <span className="h-2 w-2 flex-none bg-white" />
            <span className="font-brand text-sm font-medium uppercase tracking-wide text-white">
              Latest News & Updates
            </span>
          </div>

          <h2 className="max-w-2xl text-center font-brand text-2xl font-medium uppercase text-white md:text-3xl">
            Stay informed with our latest news and décor tips.
          </h2>

          <Link
            to="/news"
            className={`${slashButtonClasses} justify-self-start md:justify-self-end`}
          >
            Read More
          </Link>
        </div>
      </RevealSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article, index) => {
          const cardDelay = index * 0.12;
          return (
            <DirectionalReveal
              key={article.title}
              direction={cardDirections[index % cardDirections.length]}
              delay={cardDelay}
            >
              <Link
                to={article.to}
                className="group relative block h-[420px] overflow-hidden md:h-[500px] lg:h-[560px]"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <RevealSection
                  delay={cardDelay + 0.1}
                  className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 md:p-6"
                >
                  <div className="flex items-center justify-between font-brand text-xs text-white/70">
                    <span>Sanipure</span>
                    <span>{date}</span>
                  </div>

                  <h3 className="font-brand text-lg font-medium uppercase text-white">
                    {article.title}
                  </h3>
                  <p className="font-brand text-sm font-normal leading-relaxed text-white/80">
                    {article.excerpt}
                  </p>

                  <span className={`${slashButtonClasses} mt-3 w-fit`}>
                    Read More
                  </span>
                </RevealSection>
              </Link>
            </DirectionalReveal>
          );
        })}
      </div>
    </section>
  );
};

export default Articles;
