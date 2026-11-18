(() => {
  const btn = document.getElementById("rf-menu-btn");
  const drawer = document.getElementById("rf-mobile-nav");
  const closeBtn = document.getElementById("rf-mobile-close");
  const scrim = drawer?.querySelector(".mobile-nav__scrim");
  if (!btn || !drawer) return;

  const open = () => {
    drawer.dataset.open = "true";
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  };
  const close = () => {
    drawer.dataset.open = "false";
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    btn.focus();
  };

  btn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  scrim?.addEventListener("click", close);
  drawer.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
