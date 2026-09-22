import { useState } from "react";
import RevealSection from "../components/shared/RevealSection";
import project1 from "../assets/projects photos/project 1.JPG";
import project2 from "../assets/projects photos/project 2.JPG";
import project3 from "../assets/projects photos/project 3.JPG";
import project4 from "../assets/projects photos/project 4.JPG";

const projects = [
  {
    name: "Playa North Coast",
    image: project1,
    description:
      "Sanipure brings refined design and everyday functionality to Playa North Coast, complementing its spaces with thoughtfully designed products made to leave a lasting impression.",
  },
  {
    name: "Rixos Magawish",
    image: project2,
    description:
      "Bringing together quality & thoughtful design, Sanipure complements the luxurious experience of Rixos Magawish with a lasting performance across its spaces.",
  },
  {
    name: "Arkan 205",
    image: project3,
    description:
      "Sanipure supplied the bathroom solutions for Arkan Palm 205, combining practical design, lasting quality, and everyday comfort to suit the needs of modern living.",
  },
  {
    name: "Al Jazi JW Marriott Residence",
    image: project4,
    description:
      "A residential destination where every detail matters. Sanipure brings its sanitaryware to Al Jazi JW Marriott Residence, adding a balance of modern design, comfort, and dependable quality to the spaces.",
  },
];

const ProjectsPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = projects[selectedIndex];

  return (
    <>
      <RevealSection className="bg-black px-6 pb-10 pt-20 text-center md:pt-28">
        <h1 className="font-brand text-4xl font-semibold uppercase tracking-wide text-white md:text-5xl">
          Projects
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          A look at how Sanipure's sanitaryware comes to life across
          residential, hospitality, and commercial spaces.
        </p>
      </RevealSection>

      <section className="bg-black">
        <RevealSection className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {projects.map((project, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={project.name}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-pressed={isSelected}
                className="group relative aspect-[3/4] w-full cursor-pointer transition-transform duration-500 ease-out hover:z-20 hover:scale-110 hover:shadow-2xl"
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className={`h-full w-full object-cover transition-all duration-500 ${
                    isSelected
                      ? "grayscale-0"
                      : "grayscale group-hover:grayscale-0"
                  }`}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent px-3 pb-3 pt-10">
                  <span className="font-brand text-xs font-semibold uppercase tracking-wide text-white sm:text-sm">
                    {project.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white" />
                )}
              </button>
            );
          })}
        </RevealSection>

        <RevealSection key={selected.name} className="relative">
          <div className="relative h-[360px] w-full overflow-hidden md:h-[520px]">
            <img
              src={selected.image}
              alt={selected.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <h2 className="absolute bottom-6 left-6 font-brand text-3xl font-bold uppercase tracking-wide text-white md:bottom-10 md:left-12 md:text-5xl">
              {selected.name}
            </h2>
          </div>
          <div className="bg-gradient-to-b from-black to-neutral-700 px-6 py-10 md:px-12 md:py-14">
            <p className="max-w-3xl text-lg leading-relaxed text-white/80 md:text-xl">
              {selected.description}
            </p>
          </div>
        </RevealSection>
      </section>
    </>
  );
};

export default ProjectsPage;
