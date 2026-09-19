// Shared behaviour for every page.

// Optional: put your email address between the quotes to show it in the Contact section
// and the publications footer. Leave it empty to hide the email line.
const EMAIL = "";

document.querySelectorAll("[data-current-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const toggle = document.querySelector(".menu-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

if (EMAIL) {
  document.querySelectorAll("[data-email]").forEach((el) => {
    const a = el.querySelector("a");
    if (a) {
      a.href = "mailto:" + EMAIL;
      a.textContent = EMAIL;
    }
    el.hidden = false;
  });
}

// Hero image: if images/hero-thermal.jpg exists, show it in the hero and
// move the interactive mixed-pixel demo down into the Research section.
(() => {
  const fig = document.getElementById("hero-image-figure");
  const img = document.getElementById("hero-img");
  const demo = document.getElementById("demo-figure");
  const slot = document.getElementById("demo-slot");
  if (!fig || !img || !demo || !slot) return;
  const probe = new Image();
  probe.onload = () => {
    img.src = probe.src;
    fig.hidden = false;
    slot.appendChild(demo);
  };
  probe.src = "images/hero-thermal.jpg";
})();

// Profile photo: if images/profile.jpg exists, show it beside the name.
(() => {
  const photo = document.getElementById("profile-img");
  if (!photo) return;
  const probe = new Image();
  probe.onload = () => {
    photo.src = probe.src;
    photo.hidden = false;
  };
  probe.src = "images/profile.jpg";
})();
