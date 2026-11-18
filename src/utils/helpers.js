const slugify = require("slugify");
const path = require("path");

function makeSlug(text) {
  return slugify(String(text || ""), { lower: true, strict: true });
}

function parseFeatures(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

function featuresToJson(input) {
  if (Array.isArray(input)) return JSON.stringify(input.filter(Boolean));
  return JSON.stringify(
    String(input || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function normalizeImageUrl(file, fallbackUrl) {
  if (file?.filename) return `/uploads/${file.filename}`;
  if (fallbackUrl && String(fallbackUrl).trim()) return String(fallbackUrl).trim();
  return "";
}

function formatDate(iso) {
  if (!iso) return "";
  const d =
    iso instanceof Date
      ? iso
      : new Date(typeof iso === "string" && !iso.includes("T") ? iso.replace(" ", "T") + "Z" : iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const BAG_CATEGORIES = [
  { id: "all", label: "All Collections" },
  { id: "party", label: "Party Bags" },
  { id: "structured", label: "Structured Bags" },
  { id: "tote", label: "Tote Bags" },
  { id: "souvenir", label: "Souvenir Bags" },
  { id: "cross-body", label: "Cross-Body Bags" },
  { id: "clutch", label: "Clutch Bags" },
  { id: "travelling", label: "Travelling Bags" },
  { id: "corporate", label: "Corporate Bags" },
  { id: "designer", label: "Designer Bags" },
];

module.exports = {
  makeSlug,
  parseFeatures,
  featuresToJson,
  normalizeImageUrl,
  formatDate,
  BAG_CATEGORIES,
  uploadDir: path.join(__dirname, "../../public/uploads"),
};
