import Hero from "../components/Hero";
import WhySanipure from "../components/WhySanipure";
/* import CategoryCarousel2 from "../components/CategoryCarousel2"; */
import CategoryCarousel3 from "../components/CategoryCarousel3";
import NewDesignSection from "../components/NewDesignSection";
import Articles from "../components/Articles";
import { HERO_FADE_PAGE } from "../lib/heroFade";

const HomePage = () => {
  return (
    <div className={`${HERO_FADE_PAGE} bg-black`}>
      <Hero />
      <WhySanipure />
      {/* <CategoryCarousel2 /> */}
      <div className="h-32 w-full md:h-40" aria-hidden />
      <CategoryCarousel3 />
      <NewDesignSection />
      <Articles />
    </div>
  );
};

export default HomePage;
