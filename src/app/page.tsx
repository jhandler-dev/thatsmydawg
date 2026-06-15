export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      {/* Eyebrow — DM Sans 500, uppercase + wide tracking (DESIGN §3 microcopy) */}
      <p className="font-sans text-xs font-medium uppercase tracking-[0.28em] text-gold">
        That&apos;s My Dawg
      </p>

      {/* Headline — Bebas Neue via the h1 base style (font-display) */}
      <h1 className="mt-3 text-6xl text-white">That&apos;s My Dawg</h1>

      {/* Body — DM Sans, the default body family */}
      <p className="mt-4 text-bone">
        POC scaffold is running. The storefront lands in Milestone 2.
      </p>

      {/* Editorial accent — Playfair Display italic (font-serif), used sparingly */}
      <p className="mt-6 font-serif text-lg italic text-cream">
        Every shirt is your actual dog, dropped into the scene.
      </p>
    </main>
  );
}
