import Hero from "../components/Hero";
import WhySanipure from "../components/WhySanipure";
import CategoryCarousel from "../components/CategoryCarousel";
import DesignSection from "../components/DesignSection";
import Articles from "../components/Articles";

const HomePage = () => {
  return (
    <>
      <Hero />
      <WhySanipure />
      <CategoryCarousel />
      <div className="flex h-32 w-full flex-col md:h-40" aria-hidden>
        <div className="h-[40%] w-full bg-black" />
        <div className="h-[60%] w-full bg-[#2a2f36]" />
      </div>
      <DesignSection />
      <Articles />
    </>
  );
};

export default HomePage;
