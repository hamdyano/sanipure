import washbasinsImage from "../assets/categories photos/Washbasins photo.jpg";
import toiletsImage from "../assets/categories photos/Toilets photo.jpg";
import bathtubsImage from "../assets/categories photos/Bathtubs photo.jpg";
import accessoriesImage from "../assets/categories photos/Accessories photo.jpg";
import publicBathroomsImage from "../assets/categories photos/Public Bathrooms photo.jpg";
import bathroomCollectionImage from "../assets/categories photos/Bathroom collection photo.jpg";
import concealedFlushTankImage from "../assets/categories photos/Concealed Flush tank.jpeg";

export interface CarouselCategory {
  id: string;
  name: string;
  image: string;
  href: string;
  /** The category's own product page (with filters), for the categories
   *  that have one so far. */
  shopHref?: string;
  /** Same wording as the category's card on the Products page. */
  description: string;
}

// Shared by the home page's category carousels (CategoryCarousel2 and 3) and
// the category bar on each category's product page, so they always show the
// same categories, photos and text.
export const CATEGORIES: CarouselCategory[] = [
  {
    id: "washbasins",
    name: "Washbasins",
    image: washbasinsImage,
    href: "/products/washbasins",
    shopHref: "/products/washbasins/categories",
    description:
      "Explore a diverse range of washbasins made to bring character and elegance to every bathroom. Find the shape, size, and finish that suit your space.",
  },
  {
    id: "toilets",
    name: "Toilets",
    image: toiletsImage,
    href: "/products/toilets",
    shopHref: "/products/toilets/categories",
    description:
      "Discover toilets that combine refined design with advanced functionality. From rimless designs to water-saving flushing technologies, find solutions for everyday performance and lasting comfort.",
  },
  {
    id: "bathtubs",
    name: "Bathtubs",
    image: bathtubsImage,
    href: "/products/bathtubs",
    shopHref: "/products/bathtubs/categories",
    description:
      "Create a space dedicated to relaxation with our bathtubs. Discover a selection of refined forms and premium finishes designed to elevate the bathing experience.",
  },
  {
    id: "accessories",
    name: "Accessories & Furniture",
    image: accessoriesImage,
    href: "/products/accessories",
    description:
      "Complete your bathroom with furniture and accessories that bring style and practicality together. Explore functional solutions created to complement your sanitaryware and keep every detail beautifully organized.",
  },
  {
    id: "public-bathrooms",
    name: "Public Bathrooms",
    image: publicBathroomsImage,
    href: "/products/public-bathrooms",
    description:
      "Check our durable, practical solutions designed specifically for high-traffic public and commercial spaces. Our range combines reliable performance, hygiene-focused designs, and functionality to meet demanding everyday environments.",
  },
  {
    id: "bathroom-collection",
    name: "Bathroom Collection",
    image: bathroomCollectionImage,
    href: "/products/bathroom-collection",
    description:
      "Discover complete bathroom collections where every element is designed to work together seamlessly. Explore coordinated designs that create a distinctive bathroom aesthetic.",
  },
  {
    id: "concealed-flush-tank",
    name: "Concealed Flush Tank",
    image: concealedFlushTankImage,
    href: "/products/concealed-flush-tank",
    description:
      "Keep your bathroom clean and clutter-free with concealed flush tanks hidden neatly inside the wall. Enjoy quiet, water-efficient flushing and more usable space, paired with a sleek finish that suits any modern design.",
  },
];
