function requireAdmin(req, res, next) {
  if (req.session?.adminId) return next();
  req.session.returnTo = req.originalUrl;
  return res.redirect("/admin/login");
}

function exposeLocals(req, res, next) {
  res.locals.admin = req.session?.adminId
    ? { id: req.session.adminId, email: req.session.adminEmail, name: req.session.adminName }
    : null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  res.locals.currentPath = req.path;
  res.locals.site = {
    name: "Rayfort Investment Co. Ltd",
    rc: "RC 1414179",
    phone: "+234 803 528 1272",
    email: "rayfortltd@gmail.com",
    address: "4, Badejo Street",
  };
  next();
}

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

module.exports = { requireAdmin, exposeLocals, setFlash };
