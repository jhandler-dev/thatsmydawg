// That's My Dawg — seed script (W19 / #17).
// Inserts the launch scenes as Scene rows. Idempotent — upserts by slug, safe to re-run.
// Scene list + shirtColor are sourced from docs/blank-and-colors.md (source of truth).
// Bar Dog's description/badge match the documented example in docs/api/scenes.md.
//
// sceneImageUrl values are local placeholders under public/scenes/ — real artwork
// doesn't exist yet, so these paths 404 until scene art is added. The storefront's
// image-failure placeholder (W25) covers that until then.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PRICE_CENTS = 4495;

const scenes = [
  {
    slug: "bar-dog",
    name: "Bar Dog",
    description: "Cap on backwards, beer in paw, dive bar of their dreams.",
    priceCents: DEFAULT_PRICE_CENTS,
    shirtColor: "Faded Black",
    badge: "Best Seller",
    sceneImageUrl: "/scenes/bar-dog.png",
    active: true,
    sortOrder: 0,
  },
  {
    slug: "phd-dog",
    name: "The Therapist",
    description: "PhD in vibes, license to listen, couch always open.",
    priceCents: DEFAULT_PRICE_CENTS,
    shirtColor: "Faded Khaki",
    badge: null,
    sceneImageUrl: "/scenes/phd-dog.png",
    active: true,
    sortOrder: 1,
  },
  {
    slug: "western",
    name: "Desert Cowboy",
    description: "Dust on the boots, sun in the eyes, riding into legend.",
    priceCents: DEFAULT_PRICE_CENTS,
    shirtColor: "Faded Khaki",
    badge: null,
    sceneImageUrl: "/scenes/western.png",
    active: true,
    sortOrder: 2,
  },
  {
    slug: "coachella",
    name: "Pool Party",
    description: "Shades on, floatie ready, main character of the pool.",
    priceCents: DEFAULT_PRICE_CENTS,
    shirtColor: "Faded White",
    badge: "New Drop",
    sceneImageUrl: "/scenes/coachella.png",
    active: true,
    sortOrder: 3,
  },
  {
    slug: "nascar",
    name: "Race Day",
    description: "Pit crew energy, checkered flag dreams, first to the finish.",
    priceCents: DEFAULT_PRICE_CENTS,
    shirtColor: "Faded Black",
    badge: null,
    sceneImageUrl: "/scenes/nascar.png",
    active: true,
    sortOrder: 4,
  },
];

async function main() {
  for (const scene of scenes) {
    const result = await prisma.scene.upsert({
      where: { slug: scene.slug },
      update: scene,
      create: scene,
    });
    console.log(`[seed] upserted scene: ${result.slug}`);
  }
}

main()
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
