// Shared behaviour for every page.

// Optional: put your email address between the quotes to show it in the Contact section
// and the publications footer. Leave it empty to hide the email line.
const EMAIL = "thermalafterphd@gmail.com";

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
