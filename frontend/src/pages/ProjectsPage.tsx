import RevealSection from "../components/shared/RevealSection";
import DirectionalReveal from "../components/shared/DirectionalReveal";
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

const cardDirections: Array<"left" | "right"> = ["left", "right", "left", "right"];

const ProjectsPage = () => {
  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Projects
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          A look at how Sanipure's sanitaryware comes to life across
          residential, hospitality, and commercial spaces.
        </p>
      </RevealSection>

      <section className="mx-auto my-12 flex max-w-6xl flex-col gap-6 px-6 md:my-16 lg:px-12">
        {projects.map((project, index) => (
          <DirectionalReveal
            key={project.name}
            direction={cardDirections[index % cardDirections.length]}
            delay={(index % 2) * 0.1}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] lg:flex-row lg:h-64"
          >
            <div className="h-56 w-full overflow-hidden lg:h-full lg:w-2/5">
              <img
                src={project.image}
                alt={project.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 p-8 lg:p-10">
              <h3 className="text-2xl font-semibold text-white">
                {project.name}
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-white/70">
                {project.description}
              </p>
            </div>
          </DirectionalReveal>
        ))}
      </section>
    </>
  );
};

export default ProjectsPage;
