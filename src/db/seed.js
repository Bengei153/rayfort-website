require("dotenv").config();
const bcrypt = require("bcryptjs");
const { queryOne, execute, initSchema, pool } = require("./database");

const img = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const bags = [
  {
    title: "The Luminary Evening Bag",
    slug: "luminary-evening-bag",
    category: "party",
    code: "RF-PTY-201",
    summary: "Chic evening companion with mirror-finished hardware and satin lining.",
    description:
      "Hand-finished evening silhouette for galas and signing ceremonies. Detachable drop chain, magnetic clasp, and card-slot chamber.",
    features: JSON.stringify(["Metallic Trim", "Champagne Satin Lining", "Card Slot Chamber"]),
    image_url: img("photo-1594223274512-ad4803739b7c"),
    badge: "Party Series",
    price_note: "Institutional & Retail",
    is_featured: 1,
    sort_order: 1,
  },
  {
    title: "The Sovereign Structured Case",
    slug: "sovereign-structured-case",
    category: "structured",
    code: "RF-STR-104",
    summary: "Architectural vegetable-tanned case for authoritative boardroom presence.",
    description:
      "Rigid silhouette with reinforced keel and Swiss Raccagni zips. Built for folios and formal governance.",
    features: JSON.stringify(["Vegetable-Tanned", "Reinforced Keel", "Swiss Raccagni Zips"]),
    image_url: img("photo-1590874103328-eac38a683ce7"),
    badge: "Structured",
    price_note: "Signature Core",
    is_featured: 1,
    sort_order: 2,
  },
  {
    title: "The Metropolis Executive Tote",
    slug: "metropolis-executive-tote",
    category: "tote",
    code: "RF-TOT-308",
    summary: "Expansive daily carryall with padded 16-inch laptop chamber.",
    description:
      "Full-grain pebble leather tote with saddle-stitched straps, dual magnetic panels, and key tether hook.",
    features: JSON.stringify(["16-Inch Padded Sleeve", "Full-Grain Pebble", "Key Tether Hook"]),
    image_url: img("photo-1591561954557-26941169b49e"),
    badge: "Tote Series",
    price_note: "Bestseller",
    is_featured: 1,
    sort_order: 3,
  },
  {
    title: "The Heritage Commemorative Carrier",
    slug: "heritage-commemorative-carrier",
    category: "souvenir",
    code: "RF-SOU-502",
    summary: "Custom branded keepsakes for diplomatic assemblies and private trusts.",
    description:
      "Event keepsakes with foil embossing and monogramming. Ideal for institutional gifting from 25 units.",
    features: JSON.stringify(["Bespoke Monogramming", "Foil Embossing", "Tier Bulk Batches"]),
    image_url: img("photo-1566150905458-1bf1fc113f0d"),
    badge: "Souvenir Series",
    price_note: "Minimum Order: 25 Units",
    is_featured: 0,
    sort_order: 4,
  },
  {
    title: "The Nomad Executive Cross-Body",
    slug: "nomad-executive-cross-body",
    category: "cross-body",
    code: "RF-CRB-610",
    summary: "Hands-free mobility with adjustable harness and concealed clasp.",
    description:
      "Supple calfskin messenger with passport pocket and German magnetic security clasp.",
    features: JSON.stringify(["Fidlock Clasp", "Concealed Compartment", "Supple Calfskin"]),
    image_url: img("photo-1548036328-c9fa89d128fa"),
    badge: "Cross-Body",
    price_note: "Ergonomic",
    is_featured: 0,
    sort_order: 5,
  },
  {
    title: "The Opulence Envelope Clutch",
    slug: "opulence-envelope-clutch",
    category: "clutch",
    code: "RF-CLT-715",
    summary: "Minimalist envelope with Italian silk lining and wrist loop.",
    description:
      "Ultra-slim formal clutch finished with double magnetic snaps for banquets and ceremonies.",
    features: JSON.stringify(["Italian Silk Lining", "Magnetic Flap", "Ultra-Slim Profile"]),
    image_url: img("photo-1594633312681-425c7b97ccd1"),
    badge: "Clutch Series",
    price_note: "Haute Minimal",
    is_featured: 0,
    sort_order: 6,
  },
  {
    title: "The Sovereign Weekender Duffel",
    slug: "sovereign-weekender-duffel",
    category: "travelling",
    code: "RF-TRV-880",
    summary: "Aviation-ready holdall with shoe garage and brass padlock.",
    description:
      "Top-grain saddle leather weekender for transatlantic itineraries. 55-litre capacity with solid brass locks.",
    features: JSON.stringify(["55-Litre Capacity", "Separate Shoe Vent", "Solid Brass Locks"]),
    image_url: img("photo-1553062407-98eeb64c6a62"),
    badge: "Travel Series",
    price_note: "Aviation Ready",
    is_featured: 1,
    sort_order: 7,
  },
  {
    title: "The Boardroom Briefcase & Portfolio",
    slug: "boardroom-briefcase-portfolio",
    category: "corporate",
    code: "RF-COR-920",
    summary: "Institutional document carrier for directors and senior counsel.",
    description:
      "Hard-sided attache with dual code lock, suede dividers, and corporate embossing options.",
    features: JSON.stringify(["Legal Folders Depth", "Dual Code Lock", "Corporate Embossing"]),
    image_url: img("photo-1617038260897-41a1f14a8ca0"),
    badge: "Corporate Series",
    price_note: "Boardroom Class",
    is_featured: 1,
    sort_order: 8,
  },
  {
    title: "The Atelier Sculptural Masterpiece",
    slug: "atelier-sculptural-masterpiece",
    category: "designer",
    code: "RF-DES-007",
    summary: "Limited-edition numbered artisan creation with collector registry.",
    description:
      "Serialized haute piece with hand-painted bevels, French chèvre interior, and signed seal. Strictly allocated.",
    features: JSON.stringify(["Serialized Registry", "French Chèvre Interior", "Signed Seal"]),
    image_url: img("photo-1611652022419-a9419f74343d"),
    badge: "Designer Series",
    price_note: "Limited 50 Pieces",
    is_featured: 1,
    sort_order: 9,
  },
];

const classes = [
  {
    title: "Executive Public Speaking & Keynote Delivery",
    slug: "executive-public-speaking",
    module_label: "Module 01 • Signature",
    summary: "Stagecraft, diaphragmatic resonance, and authoritative command under pressure.",
    description:
      "Master platform anxiety control, grounded stillness, and a polished 7-minute keynote with cinema-grade review.",
    duration: "2 Full Days or 4 Virtual Modules",
    format: "On-site / Virtual",
    image_url: img("photo-1475721027785-f74eccf877e2"),
    is_featured: 1,
    sort_order: 1,
  },
  {
    title: "Corporate Negotiation & Persuasion",
    slug: "corporate-negotiation-persuasion",
    module_label: "Module 02",
    summary: "High-stakes commercial dialogue, deadlock mediation, and leverage cues.",
    description:
      "Anchoring, concession pacing, de-escalation protocols, and sub-vocal cadence for adversarial boards.",
    duration: "1–2 Days Intensive",
    format: "On-site / 1-on-1",
    image_url: img("photo-1556761175-5973dc0f32e7"),
    is_featured: 1,
    sort_order: 2,
  },
  {
    title: "Business Presentation Mastery",
    slug: "business-presentation-mastery",
    module_label: "Module 03",
    summary: "Turn dense dossiers into persuasive executive narratives.",
    description:
      "Slide economy, Pyramid Principle structure, and the 10-slide investor standard.",
    duration: "1 Day Workshop",
    format: "Corporate Cohort",
    image_url: img("photo-1560439513-74b037a25d84"),
    is_featured: 0,
    sort_order: 3,
  },
  {
    title: "Cross-Functional Team & Interpersonal Clarity",
    slug: "cross-functional-clarity",
    module_label: "Module 04",
    summary: "Eradicate managerial ambiguity and structural silos.",
    description:
      "Radical clarity frameworks, non-defensive feedback, and conflict deconstruction simulations.",
    duration: "2 Half-Day Sessions",
    format: "On-site / Virtual",
    image_url: img("photo-1521737604893-d14cc237f11d"),
    is_featured: 0,
    sort_order: 4,
  },
  {
    title: "Media Training & Crisis Communication",
    slug: "media-crisis-communication",
    module_label: "Module 05 • C-Suite",
    summary: "Broadcast grilling, regulatory inquiry prep, and press authority.",
    description:
      "Live mock television interrogation under hostile cross-examination with immediate phrase rewrites.",
    duration: "1 Full Day Simulation",
    format: "1-on-1 / Small Cohort",
    image_url: img("photo-1551836022-d5d88e9218df"),
    is_featured: 1,
    sort_order: 5,
  },
];

const posts = [
  {
    title: "Why Full-Grain Leather Outlasts Trend Cycles",
    slug: "why-full-grain-leather-outlasts-trend-cycles",
    excerpt: "A craftsman’s view on patina, vegetable tanning, and heirloom durability.",
    body: `<p>Trend leathers peel. Full-grain develops character. At Rayfort, every hide is inspected for tensile fiber integrity before a single stitch is laid.</p>
<p>Vegetable-tanned bovine and calf skins accept burnishing, foil, and decades of daily carry without synthetic bonding. That is why institutional clients commission pieces meant to outlive product seasons.</p>
<p>When you commission a Rayfort bag, you are not buying a season—you are registering an heirloom.</p>`,
    cover_image: img("photo-1601924994987-69e26d50dc26"),
    author: "Rayfort Atelier",
  },
  {
    title: "The First Twelve Seconds of Executive Presence",
    slug: "first-twelve-seconds-executive-presence",
    excerpt: "How boardroom audiences decide authority before the first slide advances.",
    body: `<p>Authority is established within the first twelve seconds—before a single slide advances. Breath, stillness, and eye quadrant distribution do more work than rhetoric alone.</p>
<p>Our V.O.I.C.E. matrix trains Vocal resonance, Objective clarity, Intentional pacing, Centered posture, and Emotional calibration as one system.</p>
<p>Leaders who master those twelve seconds rarely need to raise their voice again.</p>`,
    cover_image: img("photo-1475721027785-f74eccf877e2"),
    author: "Rayfort Academy",
  },
  {
    title: "Corporate Gifting That Signals Sovereign Taste",
    slug: "corporate-gifting-sovereign-taste",
    excerpt: "How embossed leather commissions elevate retreats, AGMs, and diplomatic visits.",
    body: `<p>Plastic gift bags telegraph procurement. Debossed leather carriers telegraph care.</p>
<p>From Geneva board retreats to presidential memorabilia, Rayfort fulfills monogrammed holdalls, portfolios, and commemorative carriers with white-glove presentation boxes.</p>
<p>Minimum institutional runs start at twenty-five units—precision over volume.</p>`,
    cover_image: img("photo-1547949003-9792a18a2601"),
    author: "Rayfort Editorial",
  },
];

const testimonials = [
  {
    client_name: "Adewale O.",
    client_title: "Managing Director",
    organization: "Energy Conglomerate",
    quote:
      "Rayfort’s bespoke briefcases were commissioned for our entire executive committee. The saddle stitching and weight distribution rival Mayfair houses—with a sovereign touch.",
    rating: 5,
    avatar_initials: "AO",
    division: "bags",
    is_featured: 1,
    sort_order: 1,
  },
  {
    client_name: "Fatima B.",
    client_title: "Chief Risk Officer",
    organization: "Tier-1 Financial Institution",
    quote:
      "The Boardroom Rhetoric and Crisis Simulation completely transformed how our leadership faces regulatory panels. Precise, unyielding, and profoundly effective.",
    rating: 5,
    avatar_initials: "FB",
    division: "classes",
    is_featured: 1,
    sort_order: 2,
  },
  {
    client_name: "Amb. Chinedu K.",
    client_title: "Senior Diplomatic Envoy",
    organization: "Foreign Service",
    quote:
      "I ordered their weekend travelling holdall and the party clutch for international tours. Both gathered admiration across Geneva and Washington.",
    rating: 5,
    avatar_initials: "CK",
    division: "bags",
    is_featured: 1,
    sort_order: 3,
  },
  {
    client_name: "Oluwaseun A.",
    client_title: "Chief Financial Officer",
    organization: "Pan-African Infrastructure Group",
    quote:
      "Within two sessions, our executive committee eliminated the hesitancy and speech fillers that were weakening our capital defense during investor roadshows.",
    rating: 5,
    avatar_initials: "OA",
    division: "classes",
    is_featured: 1,
    sort_order: 4,
  },
];

async function seed() {
  await initSchema();

  const email = process.env.ADMIN_EMAIL || "admin@rayfortltd.com";
  const password = process.env.ADMIN_PASSWORD || "RayfortAdmin2025!";
  const hash = await bcrypt.hash(password, 10);

  await execute("DELETE FROM inquiries");
  await execute("DELETE FROM testimonials");
  await execute("DELETE FROM blog_posts");
  await execute("DELETE FROM classes");
  await execute("DELETE FROM bag_designs");
  await execute("DELETE FROM admins");

  await execute(
    "INSERT INTO admins (email, password_hash, name) VALUES ($1, $2, $3)",
    [email, hash, "Rayfort Admin"]
  );

  for (const b of bags) {
    await execute(
      `INSERT INTO bag_designs
      (title, slug, category, code, summary, description, features, image_url, badge, price_note, is_featured, is_published, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1, $12)`,
      [
        b.title,
        b.slug,
        b.category,
        b.code,
        b.summary,
        b.description,
        b.features,
        b.image_url,
        b.badge,
        b.price_note,
        b.is_featured,
        b.sort_order,
      ]
    );
  }

  for (const c of classes) {
    await execute(
      `INSERT INTO classes
      (title, slug, module_label, summary, description, duration, format, image_url, is_featured, is_published, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10)`,
      [
        c.title,
        c.slug,
        c.module_label,
        c.summary,
        c.description,
        c.duration,
        c.format,
        c.image_url,
        c.is_featured,
        c.sort_order,
      ]
    );
  }

  for (const p of posts) {
    await execute(
      `INSERT INTO blog_posts (title, slug, excerpt, body, cover_image, author, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, 1)`,
      [p.title, p.slug, p.excerpt, p.body, p.cover_image, p.author]
    );
  }

  for (const t of testimonials) {
    await execute(
      `INSERT INTO testimonials
      (client_name, client_title, organization, quote, rating, avatar_initials, division, is_featured, is_published, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9)`,
      [
        t.client_name,
        t.client_title,
        t.organization,
        t.quote,
        t.rating,
        t.avatar_initials,
        t.division,
        t.is_featured,
        t.sort_order,
      ]
    );
  }

  const counts = await queryOne(`
    SELECT
      (SELECT COUNT(*)::int FROM bag_designs) AS bags,
      (SELECT COUNT(*)::int FROM classes) AS classes,
      (SELECT COUNT(*)::int FROM blog_posts) AS posts,
      (SELECT COUNT(*)::int FROM testimonials) AS testimonials
  `);

  console.log("Seed complete.");
  console.log(`Admin login: ${email}`);
  console.log(`Admin password: ${password}`);
  console.log(
    `Rows: ${counts.bags} bags, ${counts.classes} classes, ${counts.posts} posts, ${counts.testimonials} testimonials`
  );

  await pool.end();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
