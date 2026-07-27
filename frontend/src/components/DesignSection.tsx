import { Link } from "react-router-dom";
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

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h2 className="max-w-3xl text-4xl font-light text-white md:text-6xl">
          Design Changes Everything
        </h2>
        <p className="mt-6 max-w-xl text-lg font-light text-white/90">
          Discover how thoughtful design transforms everyday bathrooms into
          spaces that inspire — crafted with precision, built to last.
        </p>
        <div className="mt-8 flex items-center gap-8">
          <Link
            to="/projects"
            className="text-sm font-medium uppercase tracking-wide text-white underline underline-offset-4 hover:text-white/80"
          >
            Explore Our Projects
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium uppercase tracking-wide text-white underline underline-offset-4 hover:text-white/80"
          >
            Shop Collections
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DesignSection;
