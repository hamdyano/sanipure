import Hero from "../components/Hero";
import WhySanipure from "../components/WhySanipure";
import CategoryCarousel2 from "../components/CategoryCarousel2";
import CategoryCarousel3 from "../components/CategoryCarousel3";
import NewDesignSection from "../components/NewDesignSection";
import Articles from "../components/Articles";

const HomePage = () => {
  return (
    <>
      <Hero />
      <WhySanipure />
      <CategoryCarousel2 />
      <div className="flex h-32 w-full flex-col md:h-40" aria-hidden>
        <div className="h-[40%] w-full bg-black" />
        <div className="h-[60%] w-full bg-[#2a2f36]" />
      </div>
      <CategoryCarousel3 />
      <NewDesignSection />
      <Articles />
    </>
  );
};

export default HomePage;
