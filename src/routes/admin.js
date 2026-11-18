const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const db = require("../db/database");
const { requireAdmin, setFlash } = require("../middleware/auth");
const {
  makeSlug,
  featuresToJson,
  parseFeatures,
  normalizeImageUrl,
  formatDate,
  BAG_CATEGORIES,
  uploadDir,
} = require("../utils/helpers");

const router = express.Router();

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error("Only image uploads are allowed"), ok);
  },
});

function isUniqueViolation(err) {
  return err?.code === "23505" || /unique|duplicate/i.test(err?.message || "");
}

router.get("/login", (req, res) => {
  if (req.session.adminId) return res.redirect("/admin");
  res.render("admin/login", { title: "Admin Login", layout: false });
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await db.queryOne("SELECT * FROM admins WHERE email = $1", [email]);
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).render("admin/login", {
        title: "Admin Login",
        layout: false,
        error: "Invalid email or password.",
        email,
      });
    }
    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    req.session.adminName = admin.name;
    const dest = req.session.returnTo || "/admin";
    delete req.session.returnTo;
    res.redirect(dest);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireAdmin, (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const stats = await db.queryOne(`
      SELECT
        (SELECT COUNT(*)::int FROM bag_designs) AS bags,
        (SELECT COUNT(*)::int FROM classes) AS classes,
        (SELECT COUNT(*)::int FROM blog_posts) AS posts,
        (SELECT COUNT(*)::int FROM testimonials) AS testimonials,
        (SELECT COUNT(*)::int FROM inquiries) AS inquiries
    `);
    const recentInquiries = (
      await db.query("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5")
    ).map((i) => ({ ...i, created_label: formatDate(i.created_at) }));
    res.render("admin/dashboard", {
      title: "Dashboard",
      page: "dashboard",
      layout: "layouts/admin",
      stats,
      recentInquiries,
    });
  } catch (err) {
    next(err);
  }
});

/* ——— Bags / Designs ——— */
router.get("/bags", requireAdmin, async (req, res, next) => {
  try {
    const bags = await db.query(
      "SELECT * FROM bag_designs ORDER BY sort_order ASC, created_at DESC"
    );
    res.render("admin/bags-list", {
      title: "Bag Designs",
      page: "bags",
      layout: "layouts/admin",
      bags,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/bags/new", requireAdmin, (req, res) => {
  res.render("admin/bag-form", {
    title: "New Design",
    page: "bags",
    layout: "layouts/admin",
    bag: null,
    categories: BAG_CATEGORIES.filter((c) => c.id !== "all"),
  });
});

router.post("/bags", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const slug = makeSlug(req.body.slug || req.body.title);
    const image_url = normalizeImageUrl(req.file, req.body.image_url);
    await db.execute(
      `INSERT INTO bag_designs
      (title, slug, category, code, summary, description, features, image_url, badge, price_note, is_featured, is_published, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        req.body.title,
        slug,
        req.body.category,
        req.body.code || "",
        req.body.summary || "",
        req.body.description || "",
        featuresToJson(req.body.features),
        image_url,
        req.body.badge || "",
        req.body.price_note || "",
        req.body.is_featured ? 1 : 0,
        req.body.is_published ? 1 : 0,
        Number(req.body.sort_order) || 0,
      ]
    );
    setFlash(req, "success", "Design published to the catalogue.");
    res.redirect("/admin/bags");
  } catch (err) {
    setFlash(req, "error", isUniqueViolation(err) ? "Slug already exists." : err.message);
    res.redirect("/admin/bags/new");
  }
});

router.get("/bags/:id/edit", requireAdmin, async (req, res, next) => {
  try {
    const bag = await db.queryOne("SELECT * FROM bag_designs WHERE id = $1", [req.params.id]);
    if (!bag) return res.redirect("/admin/bags");
    bag.features = parseFeatures(bag.features).join(", ");
    res.render("admin/bag-form", {
      title: "Edit Design",
      page: "bags",
      layout: "layouts/admin",
      bag,
      categories: BAG_CATEGORIES.filter((c) => c.id !== "all"),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/bags/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const existing = await db.queryOne("SELECT * FROM bag_designs WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing) return res.redirect("/admin/bags");
    const slug = makeSlug(req.body.slug || req.body.title);
    const image_url = normalizeImageUrl(req.file, req.body.image_url || existing.image_url);
    await db.execute(
      `UPDATE bag_designs SET
        title=$1, slug=$2, category=$3, code=$4, summary=$5, description=$6, features=$7,
        image_url=$8, badge=$9, price_note=$10, is_featured=$11, is_published=$12, sort_order=$13,
        updated_at=NOW()
      WHERE id=$14`,
      [
        req.body.title,
        slug,
        req.body.category,
        req.body.code || "",
        req.body.summary || "",
        req.body.description || "",
        featuresToJson(req.body.features),
        image_url,
        req.body.badge || "",
        req.body.price_note || "",
        req.body.is_featured ? 1 : 0,
        req.body.is_published ? 1 : 0,
        Number(req.body.sort_order) || 0,
        req.params.id,
      ]
    );
    setFlash(req, "success", "Design updated.");
    res.redirect("/admin/bags");
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect(`/admin/bags/${req.params.id}/edit`);
  }
});

router.post("/bags/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    await db.execute("DELETE FROM bag_designs WHERE id = $1", [req.params.id]);
    setFlash(req, "success", "Design removed.");
    res.redirect("/admin/bags");
  } catch (err) {
    next(err);
  }
});

/* ——— Classes ——— */
router.get("/classes", requireAdmin, async (req, res, next) => {
  try {
    const classes = await db.query(
      "SELECT * FROM classes ORDER BY sort_order ASC, created_at DESC"
    );
    res.render("admin/classes-list", {
      title: "Classes",
      page: "classes",
      layout: "layouts/admin",
      classes,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/classes/new", requireAdmin, (req, res) => {
  res.render("admin/class-form", {
    title: "New Class",
    page: "classes",
    layout: "layouts/admin",
    course: null,
  });
});

router.post("/classes", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const slug = makeSlug(req.body.slug || req.body.title);
    const image_url = normalizeImageUrl(req.file, req.body.image_url);
    await db.execute(
      `INSERT INTO classes
      (title, slug, module_label, summary, description, duration, format, image_url, is_featured, is_published, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        req.body.title,
        slug,
        req.body.module_label || "",
        req.body.summary || "",
        req.body.description || "",
        req.body.duration || "",
        req.body.format || "",
        image_url,
        req.body.is_featured ? 1 : 0,
        req.body.is_published ? 1 : 0,
        Number(req.body.sort_order) || 0,
      ]
    );
    setFlash(req, "success", "Class added.");
    res.redirect("/admin/classes");
  } catch (err) {
    setFlash(req, "error", isUniqueViolation(err) ? "Slug already exists." : err.message);
    res.redirect("/admin/classes/new");
  }
});

router.get("/classes/:id/edit", requireAdmin, async (req, res, next) => {
  try {
    const course = await db.queryOne("SELECT * FROM classes WHERE id = $1", [req.params.id]);
    if (!course) return res.redirect("/admin/classes");
    res.render("admin/class-form", {
      title: "Edit Class",
      page: "classes",
      layout: "layouts/admin",
      course,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/classes/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const existing = await db.queryOne("SELECT * FROM classes WHERE id = $1", [req.params.id]);
    if (!existing) return res.redirect("/admin/classes");
    const slug = makeSlug(req.body.slug || req.body.title);
    const image_url = normalizeImageUrl(req.file, req.body.image_url || existing.image_url);
    await db.execute(
      `UPDATE classes SET
        title=$1, slug=$2, module_label=$3, summary=$4, description=$5, duration=$6, format=$7,
        image_url=$8, is_featured=$9, is_published=$10, sort_order=$11, updated_at=NOW()
      WHERE id=$12`,
      [
        req.body.title,
        slug,
        req.body.module_label || "",
        req.body.summary || "",
        req.body.description || "",
        req.body.duration || "",
        req.body.format || "",
        image_url,
        req.body.is_featured ? 1 : 0,
        req.body.is_published ? 1 : 0,
        Number(req.body.sort_order) || 0,
        req.params.id,
      ]
    );
    setFlash(req, "success", "Class updated.");
    res.redirect("/admin/classes");
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect(`/admin/classes/${req.params.id}/edit`);
  }
});

router.post("/classes/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    await db.execute("DELETE FROM classes WHERE id = $1", [req.params.id]);
    setFlash(req, "success", "Class removed.");
    res.redirect("/admin/classes");
  } catch (err) {
    next(err);
  }
});

/* ——— Blog ——— */
router.get("/blog", requireAdmin, async (req, res, next) => {
  try {
    const posts = (
      await db.query("SELECT * FROM blog_posts ORDER BY published_at DESC")
    ).map((p) => ({ ...p, published_label: formatDate(p.published_at) }));
    res.render("admin/blog-list", {
      title: "Blog Stories",
      page: "blog",
      layout: "layouts/admin",
      posts,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/blog/new", requireAdmin, (req, res) => {
  res.render("admin/blog-form", {
    title: "New Story",
    page: "blog",
    layout: "layouts/admin",
    post: null,
  });
});

router.post("/blog", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const slug = makeSlug(req.body.slug || req.body.title);
    const cover_image = normalizeImageUrl(req.file, req.body.cover_image);
    await db.execute(
      `INSERT INTO blog_posts (title, slug, excerpt, body, cover_image, author, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        req.body.title,
        slug,
        req.body.excerpt || "",
        req.body.body || "",
        cover_image,
        req.body.author || "Rayfort Editorial",
        req.body.is_published ? 1 : 0,
      ]
    );
    setFlash(req, "success", "Story published.");
    res.redirect("/admin/blog");
  } catch (err) {
    setFlash(req, "error", isUniqueViolation(err) ? "Slug already exists." : err.message);
    res.redirect("/admin/blog/new");
  }
});

router.get("/blog/:id/edit", requireAdmin, async (req, res, next) => {
  try {
    const post = await db.queryOne("SELECT * FROM blog_posts WHERE id = $1", [req.params.id]);
    if (!post) return res.redirect("/admin/blog");
    res.render("admin/blog-form", {
      title: "Edit Story",
      page: "blog",
      layout: "layouts/admin",
      post,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/blog/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const existing = await db.queryOne("SELECT * FROM blog_posts WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing) return res.redirect("/admin/blog");
    const slug = makeSlug(req.body.slug || req.body.title);
    const cover_image = normalizeImageUrl(
      req.file,
      req.body.cover_image || existing.cover_image
    );
    await db.execute(
      `UPDATE blog_posts SET
        title=$1, slug=$2, excerpt=$3, body=$4, cover_image=$5, author=$6, is_published=$7,
        updated_at=NOW()
      WHERE id=$8`,
      [
        req.body.title,
        slug,
        req.body.excerpt || "",
        req.body.body || "",
        cover_image,
        req.body.author || "Rayfort Editorial",
        req.body.is_published ? 1 : 0,
        req.params.id,
      ]
    );
    setFlash(req, "success", "Story updated.");
    res.redirect("/admin/blog");
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect(`/admin/blog/${req.params.id}/edit`);
  }
});

router.post("/blog/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    await db.execute("DELETE FROM blog_posts WHERE id = $1", [req.params.id]);
    setFlash(req, "success", "Story removed.");
    res.redirect("/admin/blog");
  } catch (err) {
    next(err);
  }
});

/* ——— Testimonials ——— */
router.get("/testimonials", requireAdmin, async (req, res, next) => {
  try {
    const testimonials = await db.query(
      "SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC"
    );
    res.render("admin/testimonials-list", {
      title: "Testimonials",
      page: "testimonials",
      layout: "layouts/admin",
      testimonials,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/testimonials/new", requireAdmin, (req, res) => {
  res.render("admin/testimonial-form", {
    title: "New Testimonial",
    page: "testimonials",
    layout: "layouts/admin",
    item: null,
  });
});

router.post("/testimonials", requireAdmin, async (req, res) => {
  try {
    const initials =
      req.body.avatar_initials ||
      String(req.body.client_name || "")
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    await db.execute(
      `INSERT INTO testimonials
      (client_name, client_title, organization, quote, rating, avatar_initials, division, is_featured, is_published, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        req.body.client_name,
        req.body.client_title || "",
        req.body.organization || "",
        req.body.quote,
        Number(req.body.rating) || 5,
        initials,
        req.body.division || "both",
        req.body.is_featured ? 1 : 0,
        req.body.is_published ? 1 : 0,
        Number(req.body.sort_order) || 0,
      ]
    );
    setFlash(req, "success", "Testimonial added.");
    res.redirect("/admin/testimonials");
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect("/admin/testimonials/new");
  }
});

router.get("/testimonials/:id/edit", requireAdmin, async (req, res, next) => {
  try {
    const item = await db.queryOne("SELECT * FROM testimonials WHERE id = $1", [
      req.params.id,
    ]);
    if (!item) return res.redirect("/admin/testimonials");
    res.render("admin/testimonial-form", {
      title: "Edit Testimonial",
      page: "testimonials",
      layout: "layouts/admin",
      item,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/testimonials/:id", requireAdmin, async (req, res) => {
  try {
    await db.execute(
      `UPDATE testimonials SET
        client_name=$1, client_title=$2, organization=$3, quote=$4, rating=$5,
        avatar_initials=$6, division=$7, is_featured=$8, is_published=$9, sort_order=$10,
        updated_at=NOW()
      WHERE id=$11`,
      [
        req.body.client_name,
        req.body.client_title || "",
        req.body.organization || "",
        req.body.quote,
        Number(req.body.rating) || 5,
        req.body.avatar_initials || "",
        req.body.division || "both",
        req.body.is_featured ? 1 : 0,
        req.body.is_published ? 1 : 0,
        Number(req.body.sort_order) || 0,
        req.params.id,
      ]
    );
    setFlash(req, "success", "Testimonial updated.");
    res.redirect("/admin/testimonials");
  } catch (err) {
    setFlash(req, "error", err.message);
    res.redirect(`/admin/testimonials/${req.params.id}/edit`);
  }
});

router.post("/testimonials/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    await db.execute("DELETE FROM testimonials WHERE id = $1", [req.params.id]);
    setFlash(req, "success", "Testimonial removed.");
    res.redirect("/admin/testimonials");
  } catch (err) {
    next(err);
  }
});

router.get("/inquiries", requireAdmin, async (req, res, next) => {
  try {
    const inquiries = (
      await db.query("SELECT * FROM inquiries ORDER BY created_at DESC")
    ).map((i) => ({ ...i, created_label: formatDate(i.created_at) }));
    res.render("admin/inquiries", {
      title: "Inquiries",
      page: "inquiries",
      layout: "layouts/admin",
      inquiries,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
