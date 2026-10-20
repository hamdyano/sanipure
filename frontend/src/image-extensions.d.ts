// vite/client only declares lowercase image extensions, but several photos
// in src/assets were saved as .JPG / .PNG. Vite imports them fine at
// runtime; these declarations let TypeScript accept them too.
declare module "*.JPG" {
  const src: string;
  export default src;
}

declare module "*.JPEG" {
  const src: string;
  export default src;
}

declare module "*.PNG" {
  const src: string;
  export default src;
}
