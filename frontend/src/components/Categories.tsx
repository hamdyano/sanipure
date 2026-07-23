import { Link } from "react-router-dom";

const categories = [
  {
    name: "Washbasins",
    cta: "Shop Washbasins",
    to: "/products/washbasins",
    image:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Toilets",
    cta: "Shop Toilets",
    to: "/products/toilets",
    image:
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Bathtubs",
    cta: "Shop Bathtubs",
    to: "/products/bathtubs",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Accessories",
    cta: "Shop Accessories",
    to: "/products/accessories",
    image:
      "https://images.unsplash.com/photo-1685084844860-5d94e6c82939?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Public Bathrooms",
    cta: "Shop Public Bathrooms",
    to: "/products/public-bathrooms",
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=80",
  },
];

const Categories = () => {
  return (
    <section className="mb-20 bg-[#080808] md:mb-28">
      <h2 className="px-6 pb-8 pt-12 text-center text-4xl font-semibold text-white md:text-5xl">
        Our Category
      </h2>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {categories.map((category, index) => (
          <Link
            key={category.name}
            to={category.to}
            className={`group relative block h-[380px] overflow-hidden lg:h-[440px] ${
              index === categories.length - 1 ? "sm:col-span-2" : ""
            }`}
          >
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <h3 className="text-2xl font-medium text-white md:text-3xl">
                {category.name}
              </h3>
              <span className="text-sm font-medium text-white underline underline-offset-4">
                {category.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
