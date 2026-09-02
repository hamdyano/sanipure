import { Link } from "react-router-dom";
import DirectionalReveal from "./shared/DirectionalReveal";
import designVideo from "../assets/design video.mp4";

const DesignSection = () => {
  return (
    <section className="relative mb-20 h-screen w-full overflow-hidden bg-black md:mb-28">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={designVideo}
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 bg-black/40" />

      <DirectionalReveal
        direction="up"
        delay={0.12}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <h2 className="max-w-3xl font-brand text-4xl font-medium uppercase text-white md:text-6xl">
          Design That Define Excellence
        </h2>
        <p className="mt-6 max-w-xl font-brand text-xl text-white/90">
          Our products are featured in leading hospitality, residential, governmental, and commercial developments, delivering exceptional performance across high scale projects.
        </p>
        <div className="mt-8 flex items-center gap-8">
          <Link
            to="/projects"
            className="relative inline-flex items-center justify-center border-y border-white px-8 py-3 font-brand text-lg font-bold italic uppercase tracking-wide text-white transition-opacity hover:opacity-70 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:-skew-x-[20deg] before:bg-white before:content-[''] after:absolute after:right-0 after:top-0 after:h-full after:w-px after:-skew-x-[20deg] after:bg-white after:content-['']"
          >
            View All Projects
          </Link>
        </div>
      </DirectionalReveal>
    </section>
  );
};

export default DesignSection;
