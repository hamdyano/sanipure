import { Link, Navigate, useParams } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import { getNewsArticle, newsArticles } from "../data/news";

const NewsArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getNewsArticle(slug) : undefined;

  if (!article) return <Navigate to="/news" replace />;

  const moreNews = newsArticles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <>
      <section className="relative flex h-[60svh] min-h-[420px] items-end overflow-hidden bg-black">
        <img
          src={article.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <RevealSection className="relative mx-auto w-full max-w-4xl px-6 pb-12 md:pb-16">
          <span className="block h-0.5 w-8 bg-white" />
          <p className="mt-3 font-brand text-sm text-white/90 md:text-base">
            {article.category} · {article.date}
          </p>
          <h1 className="mt-2 font-brand text-[clamp(36px,5.5vw,72px)] font-medium uppercase leading-[0.95] text-white">
            {article.title}
          </h1>
        </RevealSection>
      </section>

      <RevealSection className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <Link
          to="/news"
          className="text-sm text-white/60 transition-colors hover:text-white"
        >
          ← Back to News
        </Link>
        <p className="mt-8 text-lg leading-relaxed text-white md:text-xl">
          {article.excerpt}
        </p>
        {article.body.map((paragraph) => (
          <p key={paragraph} className="mt-6 text-base leading-relaxed text-white/75">
            {paragraph}
          </p>
        ))}
      </RevealSection>

      <section className="mx-auto mb-24 max-w-7xl px-6 md:mb-32">
        <h2 className="mb-8 font-brand text-2xl font-medium uppercase text-white md:text-3xl">
          More News
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {moreNews.map((item) => (
            <Link
              key={item.slug}
              to={`/news/${item.slug}`}
              className="group relative block h-80 overflow-hidden rounded-2xl"
            >
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="block h-0.5 w-5 bg-white" />
                <p className="mt-2 text-xs text-white/80">
                  {item.category} · {item.date}
                </p>
                <h3 className="mt-1 font-brand text-lg font-medium uppercase leading-tight text-white">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default NewsArticlePage;
