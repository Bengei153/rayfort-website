require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");

const { initSchema } = require("./db/database");
const { exposeLocals } = require("./middleware/auth");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rayfort-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  })
);
app.use(express.static(path.join(__dirname, "../public")));
app.use(exposeLocals);

app.use("/", publicRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "Page not found", page: "", layout: "layouts/main" });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).send("Something went wrong. Please try again.");
});

async function start() {
  await initSchema();
  app.listen(PORT, () => {
    console.log(`Rayfort site running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
