// Where each category's product pages live (see the routes in App.tsx).
const PRODUCT_PAGE_BASE: Record<string, string> = {
  toilets: "/products/toilets/shop-toilets",
  washbasins: "/products/washbasins/shop-washbasins",
  bathtubs: "/products/bathtubs/shop-bathtubs",
  "concealed-flush-tank": "/products/concealed-flush-tank/categories",
  "public-bathrooms": "/products/public-bathrooms/categories",
  accessories: "/products/accessories/categories",
};

/** The public product page for a product in the given category slug. */
export const productPagePath = (categorySlug: string, productId: string) => {
  const base = PRODUCT_PAGE_BASE[categorySlug];
  return base ? `${base}/${productId}` : "/products";
};
