import { Link } from "react-router-dom";
import { motion } from "motion/react";
import heroVideo from "../assets/hero  video.mp4";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
      />

      <motion.div
        className="absolute inset-0 bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      >
        <h1 className="max-w-3xl text-4xl font-semibold text-white md:text-6xl">
          Shaping Spaces Worldwide
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/90">
          Premium sanitaryware crafted with innovative technology, exceptional
          quality, and contemporary design for homeowners in addition to the
          residential and commercial projects.
        </p>
        <div className="mt-8 flex items-center gap-8">
          <Link
            to="/products"
            className="text-sm font-medium uppercase tracking-wide text-white underline underline-offset-4 hover:text-white/80"
          >
            Explore Products
          </Link>
          <Link
            to="/who-we-are"
            className="text-sm font-medium uppercase tracking-wide text-white underline underline-offset-4 hover:text-white/80"
          >
            View Projects
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
