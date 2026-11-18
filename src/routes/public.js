const express = require("express");
const db = require("../db/database");
const { parseFeatures, BAG_CATEGORIES, formatDate } = require("../utils/helpers");
const { setFlash } = require("../middleware/auth");

const router = express.Router();

async function publishedBags({ featuredOnly = false, limit = null } = {}) {
  const params = [];
  let sql = `SELECT * FROM bag_designs WHERE is_published = 1`;
  if (featuredOnly) sql += ` AND is_featured = 1`;
  sql += ` ORDER BY sort_order ASC, created_at DESC`;
  if (limit) {
    params.push(Number(limit));
    sql += ` LIMIT $${params.length}`;
  }
  const rows = await db.query(sql, params);
  return rows.map((b) => ({ ...b, features: parseFeatures(b.features) }));
}

async function publishedClasses({ featuredOnly = false, limit = null } = {}) {
  const params = [];
  let sql = `SELECT * FROM classes WHERE is_published = 1`;
  if (featuredOnly) sql += ` AND is_featured = 1`;
  sql += ` ORDER BY sort_order ASC, created_at DESC`;
  if (limit) {
    params.push(Number(limit));
    sql += ` LIMIT $${params.length}`;
  }
  return db.query(sql, params);
}

router.get("/", async (req, res, next) => {
  try {
    const bags = await publishedBags({ featuredOnly: true, limit: 6 });
    const classes = await publishedClasses({ featuredOnly: true, limit: 4 });
    const posts = (
      await db.query(
        `SELECT id, title, slug, excerpt, cover_image, author, published_at
         FROM blog_posts WHERE is_published = 1
         ORDER BY published_at DESC LIMIT 3`
      )
    ).map((p) => ({ ...p, published_label: formatDate(p.published_at) }));
    const testimonials = await db.query(
      `SELECT * FROM testimonials WHERE is_published = 1 AND is_featured = 1
       ORDER BY sort_order ASC LIMIT 3`
    );

    res.render("home", {
      title: "Home",
      page: "home",
      bags,
      classes,
      posts,
      testimonials,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/bags", async (req, res, next) => {
  try {
    const category = req.query.category || "all";
    let bags = await publishedBags();
    if (category !== "all") bags = bags.filter((b) => b.category === category);

    res.render("bags", {
      title: "Rayfort Bags",
      page: "bags",
      bags,
      categories: BAG_CATEGORIES,
      activeCategory: category,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/bags/:slug", async (req, res, next) => {
  try {
    const bag = await db.queryOne(
      `SELECT * FROM bag_designs WHERE slug = $1 AND is_published = 1`,
      [req.params.slug]
    );
    if (!bag) return res.status(404).render("404", { title: "Not found", page: "" });
    bag.features = parseFeatures(bag.features);
    res.render("bag-detail", { title: bag.title, page: "bags", bag });
  } catch (err) {
    next(err);
  }
});

router.get("/classes", async (req, res, next) => {
  try {
    const classes = await publishedClasses();
    res.render("classes", {
      title: "Executive Classes",
      page: "classes",
      classes,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/classes/:slug", async (req, res, next) => {
  try {
    const course = await db.queryOne(
      `SELECT * FROM classes WHERE slug = $1 AND is_published = 1`,
      [req.params.slug]
    );
    if (!course) return res.status(404).render("404", { title: "Not found", page: "" });
    res.render("class-detail", { title: course.title, page: "classes", course });
  } catch (err) {
    next(err);
  }
});

router.get("/blog", async (req, res, next) => {
  try {
    const posts = (
      await db.query(
        `SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC`
      )
    ).map((p) => ({ ...p, published_label: formatDate(p.published_at) }));
    res.render("blog", { title: "Stories & Insights", page: "blog", posts });
  } catch (err) {
    next(err);
  }
});

router.get("/blog/:slug", async (req, res, next) => {
  try {
    const post = await db.queryOne(
      `SELECT * FROM blog_posts WHERE slug = $1 AND is_published = 1`,
      [req.params.slug]
    );
    if (!post) return res.status(404).render("404", { title: "Not found", page: "" });
    post.published_label = formatDate(post.published_at);
    res.render("blog-detail", { title: post.title, page: "blog", post });
  } catch (err) {
    next(err);
  }
});

router.get("/testimonials", async (req, res, next) => {
  try {
    const division = req.query.division || "all";
    let testimonials = await db.query(
      `SELECT * FROM testimonials WHERE is_published = 1 ORDER BY sort_order ASC, created_at DESC`
    );
    if (division !== "all") {
      testimonials = testimonials.filter(
        (t) => t.division === division || t.division === "both"
      );
    }
    res.render("testimonials", {
      title: "Client Testimonials",
      page: "testimonials",
      testimonials,
      activeDivision: division,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/about", (req, res) => {
  res.render("about", { title: "About Us", page: "about" });
});

router.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Us",
    page: "contact",
    queryInterest: req.query.interest || "",
  });
});

router.post("/contact", async (req, res, next) => {
  try {
    const { full_name, email, phone, interest, message } = req.body;
    if (!full_name || !email) {
      setFlash(req, "error", "Name and email are required.");
      return res.redirect("/contact#inquiry");
    }
    await db.execute(
      `INSERT INTO inquiries (full_name, email, phone, interest, message, source)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [full_name, email, phone || "", interest || "", message || "", "contact"]
    );
    setFlash(
      req,
      "success",
      "Inquiry dispatched. A concierge officer will respond within two business hours."
    );
    res.redirect("/contact#inquiry");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
