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

// Outer cards slide in from their nearer edge, inner cards rise from below.
const cardDirections: Array<"left" | "right" | "up"> = [
  "left",
  "up",
  "up",
  "right",
];

const Articles = () => {
  return (
    <section className="mb-20 bg-[oklch(21.8%_0.008_223.9)] px-6 py-20 md:mb-28 lg:px-16">
      <RevealSection className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="flex items-center gap-2 md:pt-2">
          <span className="h-2 w-2 flex-none bg-white" />
          <span className="text-sm font-medium uppercase tracking-wide text-white">
            Our Article
          </span>
        </div>

        <h2 className="max-w-2xl text-3xl font-medium text-white md:text-4xl">
          Get inspired by creative bathroom design ideas that blend style
          with comfort
        </h2>

        <Link
          to="/news"
          className="inline-flex w-fit items-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
          Learn More
        </Link>
      </RevealSection>

      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article, index) => {
          const cardDelay = index * 0.12;
          return (
            <DirectionalReveal
              key={article.title}
              direction={cardDirections[index % cardDirections.length]}
              delay={cardDelay}
              className="h-full"
            >
              <article className="flex h-full flex-col bg-black">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-56 w-full object-cover"
                />
                <RevealSection
                  delay={cardDelay + 0.1}
                  className="flex flex-1 flex-col gap-3 p-5"
                >
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1.5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="h-3.5 w-3.5"
                      >
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M5 20c1.5-3.5 4.5-5 7-5s5.5 1.5 7 5" />
                      </svg>
                      Sanipure
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="h-3.5 w-3.5"
                      >
                        <rect x="3" y="5" width="18" height="16" rx="1" />
                        <path d="M3 10h18M8 3v4M16 3v4" />
                      </svg>
                      {date}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    {article.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    {article.excerpt}
                  </p>

                  <Link
                    to={article.to}
                    className="mt-auto w-fit bg-white px-4 py-2 text-xs font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/90"
                  >
                    Learn more
                  </Link>
                </RevealSection>
              </article>
            </DirectionalReveal>
          );
        })}
      </div>
    </section>
  );
};

export default Articles;
