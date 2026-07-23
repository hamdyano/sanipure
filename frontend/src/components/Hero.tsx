import { Link } from "react-router-dom";
import heroVideo from "../assets/hero  video.mp4";

const Hero = () => {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-3xl text-4xl font-semibold text-white md:text-6xl">
          Find Your Next Sanitary Ware &amp; Bath Fittings
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/90">
          Discover premium bathroom collections designed for modern living.
        </p>
        <div className="mt-8 flex items-center gap-8">
          <Link
            to="/products"
            className="text-sm font-medium uppercase tracking-wide text-white underline underline-offset-4 hover:text-white/80"
          >
            Shop Now
          </Link>
          <Link
            to="/who-we-are"
            className="text-sm font-medium uppercase tracking-wide text-white underline underline-offset-4 hover:text-white/80"
          >
            Explore Sanipure
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
