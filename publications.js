// Search and filters for publications.html
(() => {
  const search = document.getElementById("search");
  const yearSel = document.getElementById("year-filter");
  const typeSel = document.getElementById("type-filter");
  const reset = document.getElementById("reset-filters");
  const count = document.getElementById("filter-count");
  const none = document.getElementById("no-results");
  const groups = [...document.querySelectorAll(".year-group")];
  const rows = [...document.querySelectorAll(".pub-row")];
  if (!search) return;

  const total = rows.length;

  function apply() {
    const q = search.value.toLowerCase().trim();
    const year = yearSel.value;
    const type = typeSel.value;
    let shown = 0;

    rows.forEach((row) => {
      const ok =
        (!q || row.dataset.text.includes(q)) &&
        (!year || row.dataset.year === year) &&
        (!type || row.dataset.type === type);
      row.hidden = !ok;
      if (ok) shown++;
    });
    groups.forEach((g) => {
      g.hidden = !g.querySelector(".pub-row:not([hidden])");
    });

    count.textContent = shown === total ? `Showing all ${total} records.` : `Showing ${shown} of ${total} records.`;
    none.style.display = shown === 0 ? "block" : "none";
  }

  [search, yearSel, typeSel].forEach((el) => el.addEventListener("input", apply));
  reset.addEventListener("click", () => {
    search.value = "";
    yearSel.value = "";
    typeSel.value = "";
    apply();
    search.focus();
  });

  const params = new URLSearchParams(location.search);
  if (params.get("q")) search.value = params.get("q");
  apply();
})();
