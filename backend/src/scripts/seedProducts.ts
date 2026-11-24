// Adds a ready-made set of products to a shop category, exactly as the admin
// dashboard would: each photo is saved to the uploads folder (storage.ts), then
// a Product row is created with its filter attributes, main image and display
// details (description + gallery). Each set's photos live in its own folder
// under frontend/src/assets.
//
// Safe to run more than once: a product whose name already exists in the
// category is skipped. Without --apply it only reads and reports.
//
//   npx ts-node src/scripts/seedProducts.ts <category>                  (dry run)
//   npx ts-node src/scripts/seedProducts.ts <category> --apply --owner <email>
//
// <category> is one of the keys of SETS below. --owner ties the products to
// that account, so they show up (and can be edited) in that user's dashboard
// — the dashboard only lists your own.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../prisma";
import { saveUpload } from "../storage";

const ASSETS_DIR = path.resolve(__dirname, "../../../frontend/src/assets");

interface SeedProduct {
  name: string;
  /** Filter attributes; values must be options of the category's filters. */
  attributes: Record<string, string>;
  /** Main photo, also the first gallery image. */
  file: string;
  /** Extra gallery photos (e.g. the product installed in a room). */
  gallery?: string[];
  description: string;
}

interface SeedSet {
  /** Folder under frontend/src/assets holding this set's photos. */
  folder: string;
  products: SeedProduct[];
}

const ACCESSORIES_SET_NOTE =
  "Part of a matching set with the towel bar, hook, toilet roll holder, soap dishes and shelf.";

const SETS: Record<string, SeedSet> = {
  accessories: {
    folder: "Accessories & Furniture images",
    products: [
      {
        name: "Towel Bar",
        attributes: { type: "Towel Holders" },
        file: "Towel Holder.png",
        gallery: ["Accessories Mood.png"],
        description: `A wall-mounted towel bar: a warm-toned rail held between two soft white wall brackets, long enough to hang a full bath towel. ${ACCESSORIES_SET_NOTE}`,
      },
      {
        name: "Double Towel Hook",
        attributes: { type: "Hooks" },
        file: "Double holder.png",
        gallery: ["Accessories Mood.png"],
        description: `A double hook with two rounded arms, so a towel and a bathrobe can hang side by side. Its smooth white body fixes to the wall with two screws and has no sharp edges to catch fabric. ${ACCESSORIES_SET_NOTE}`,
      },
      {
        name: "Toilet Roll Holder",
        attributes: { type: "Toilet Roll Holders" },
        file: "Toilet paper 1.png",
        gallery: ["Accessories Mood.png"],
        description: `A covered toilet roll holder. The rounded white hood keeps the roll clean and dry, and the roll sits on a spindle underneath, within easy reach. ${ACCESSORIES_SET_NOTE}`,
      },
      {
        name: "Large Soap Dish",
        attributes: { type: "Soap Dishes" },
        file: "big soap.png",
        gallery: ["Accessories Mood.png"],
        description: `A wide wall-mounted soap dish with a raised, ribbed base that lifts the soap clear of water so it drains and dries between uses. The long tray has room for more than one bar. ${ACCESSORIES_SET_NOTE}`,
      },
      {
        name: "Small Soap Dish",
        attributes: { type: "Soap Dishes" },
        file: "small soap.png",
        gallery: ["Accessories Mood.png"],
        description: `A compact wall-mounted soap dish with a deep, sloping front and a ribbed base that keeps the soap above standing water. Fits neatly beside a basin or in the shower. ${ACCESSORIES_SET_NOTE}`,
      },
      {
        name: "Bathroom Shelf",
        attributes: { type: "Shelves" },
        file: "shelf.png",
        gallery: ["Accessories Mood.png"],
        description: `A slim wall-mounted shelf with a softly rounded front edge, made for everyday essentials such as soap bottles, lotions and perfumes. ${ACCESSORIES_SET_NOTE}`,
      },
    ],
  },

  "public-bathrooms": {
    folder: "Public Bathroom images",
    products: [
      {
        name: "Taurus Urinal",
        attributes: { type: "Urinals", series: "Taurus", shape: "Rectangular" },
        file: "Taurus Urinal.png",
        gallery: ["Taurus Mood.png"],
        description:
          "A wall-hung urinal with crisp, angular lines: a squared-off body, an open front and a faceted base. Water connects through the inlet on top, and a chrome waste sits in the floor of the bowl. Its straight sides line up neatly in a row, with a Urinal Separator between each unit for privacy.",
      },
      {
        name: "Urion Urinal",
        attributes: { type: "Urinals", series: "Urion", shape: "Circular" },
        file: "Urion Urinal.png",
        gallery: ["Urion Mood.png"],
        description:
          "A wall-hung urinal with a softly rounded body and a deep, oval opening. Water connects through the inlet on top, and the smooth curves leave no corners for dirt to collect, so it stays quick to clean in busy washrooms. Pairs with the Urinal Separator for privacy between units.",
      },
      {
        name: "Urinal Separator",
        attributes: { type: "Urinal Separators" },
        file: "Urinal Seperator.png",
        gallery: ["Taurus Mood.png", "Urion Mood.png"],
        description:
          "A wall-mounted privacy panel that fits between urinals, giving each user a screen of their own. Its rounded corners and smooth white surface wipe clean easily. Works with both the Taurus and Urion urinals.",
      },
    ],
  },
};

const uploadImage = async (filePath: string): Promise<string> => {
  const buffer = await readFile(filePath);
  // Same storage as the dashboard upload (makeUploadHandler in products.ts).
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";
  try {
    return await saveUpload(buffer, contentType);
  } catch (err) {
    throw new Error(`Uploading ${path.basename(filePath)} failed: ${(err as Error).message}`);
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const slug = args[0];
  const apply = args.includes("--apply");
  const ownerIndex = args.indexOf("--owner");
  const ownerEmail = ownerIndex >= 0 ? args[ownerIndex + 1] : undefined;

  const set = slug ? SETS[slug] : undefined;
  if (!set) {
    throw new Error(`Usage: seedProducts.ts <${Object.keys(SETS).join("|")}> [--apply] [--owner <email>]`);
  }
  const dir = path.join(ASSETS_DIR, set.folder);

  // Every photo must be there before anything is written.
  const allFiles = [...new Set(set.products.flatMap((p) => [p.file, ...(p.gallery ?? [])]))];
  for (const file of allFiles) await readFile(path.join(dir, file));

  let ownerId: string | undefined;
  if (ownerEmail) {
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: { id: true },
    });
    if (!owner) throw new Error("No account with the email given to --owner");
    ownerId = owner.id;
  }

  const category = await prisma.category.findUnique({ where: { slug } });
  const existing = category
    ? await prisma.product.findMany({ where: { categoryId: category.id }, select: { name: true } })
    : [];
  const existingNames = new Set(existing.map((p) => p.name.trim().toLowerCase()));
  const toCreate = set.products.filter((p) => !existingNames.has(p.name.toLowerCase()));

  console.log(`"${slug}" products already in the database: ${existing.length}`);
  for (const p of set.products) {
    const attrs = Object.values(p.attributes).join(", ");
    console.log(`  ${toCreate.includes(p) ? "+ create" : "= exists"}  ${p.name} (${attrs})`);
  }
  console.log(`Owner: ${ownerId ? "found" : "none (products won't appear in any dashboard)"}`);

  if (!apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to create them.");
    return;
  }
  if (toCreate.length === 0) {
    console.log("\nNothing to do.");
    return;
  }

  const categoryRecord = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: { slug, name: slug },
  });

  // Upload each photo once, even when several products share it.
  const urls = new Map<string, string>();
  const urlFor = async (file: string) => {
    if (!urls.has(file)) urls.set(file, await uploadImage(path.join(dir, file)));
    return urls.get(file)!;
  };

  for (const p of toCreate) {
    const imageUrl = await urlFor(p.file);
    const gallery = [imageUrl];
    for (const file of p.gallery ?? []) gallery.push(await urlFor(file));

    await prisma.product.create({
      data: {
        categoryId: categoryRecord.id,
        name: p.name,
        attributes: {
          ...p.attributes,
          image: imageUrl,
          display: { description: p.description, images: gallery },
        },
        createdById: ownerId,
      },
    });
    console.log(`Created ${p.name}`);
  }
};

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
