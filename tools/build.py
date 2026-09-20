#!/usr/bin/env python3
"""Rebuild publications.html and the "Selected publications" block on index.html.

Edit data/publications.json, then run from the repository root:

    python3 tools/build.py

Each record needs: year, type ("Journal article" or "Conference paper"), title,
authors (list, "I. Surname" style), venue, detail, cites, doi, scopus, selected.
Set "selected": true to show a record on the home page.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SELF = "S. Sarath"          # this name is shown in bold in author lists
esc = html.escape


def load():
    records = json.loads((ROOT / "data" / "publications.json").read_text(encoding="utf-8"))
    return sorted(records, key=lambda r: -r["year"])  # stable: keeps file order within a year


def h_index(records):
    counts = sorted((r["cites"] for r in records), reverse=True)
    return max([i + 1 for i, c in enumerate(counts) if c >= i + 1] or [0])


def authors_html(authors):
    return ", ".join(f"<strong>{esc(a)}</strong>" if a == SELF else esc(a) for a in authors)


def cites_text(n):
    return f"Cited {n} time" + ("" if n == 1 else "s")


def link_title(r):
    if r["doi"]:
        return f'<a href="https://doi.org/{esc(r["doi"])}" target="_blank" rel="noopener">{esc(r["title"])}</a>'
    if r["scopus"]:
        return f'<a href="{esc(r["scopus"])}" target="_blank" rel="noopener">{esc(r["title"])}</a>'
    return esc(r["title"])


def venue_html(r):
    detail = f", {esc(r['detail'])}" if r["detail"] else ""
    return f"<em>{esc(r['venue'])}</em>{detail}"


def selected_row(r):
    cited = f" {cites_text(r['cites'])}." if r["cites"] >= 5 else ""
    return f"""          <article class="pub-row">
            <span class="pub-year">{r['year']}</span>
            <div>
              <h3 class="pub-title">{link_title(r)}</h3>
              <p class="pub-authors">{authors_html(r['authors'])}</p>
              <p class="pub-venue">{venue_html(r)}.{cited}</p>
            </div>
          </article>"""


def full_row(r):
    text = " ".join([r["title"], " ".join(r["authors"]), r["venue"], str(r["year"]), r["type"]]).lower()
    links = []
    if r["doi"]:
        links.append(f'<a href="https://doi.org/{esc(r["doi"])}" target="_blank" rel="noopener">DOI</a>')
    if r["scopus"]:
        links.append(f'<a href="{esc(r["scopus"])}" target="_blank" rel="noopener">Scopus record</a>')
    return f"""        <article class="pub-row" data-year="{r['year']}" data-type="{esc(r['type'])}" data-text="{esc(text)}">
          <h3 class="pub-title">{link_title(r)}</h3>
          <p class="pub-authors">{authors_html(r['authors'])}</p>
          <p class="pub-venue">{venue_html(r)}.</p>
          <p class="pub-meta"><span>{esc(r['type'])}</span>{f"<span>{cites_text(r['cites'])}</span>" if r['cites'] else ''}{''.join(f'<span>{l}</span>' for l in links)}</p>
        </article>"""


def build_index(records):
    path = ROOT / "index.html"
    page = path.read_text(encoding="utf-8")
    rows = "\n".join(selected_row(r) for r in records if r.get("selected"))
    page = re.sub(r"<!-- selected:start -->.*?<!-- selected:end -->",
                  lambda m: f"<!-- selected:start -->\n{rows}\n          <!-- selected:end -->", page, flags=re.S)
    first = min(r["year"] for r in records)
    stats = f"Since {first}, I have published {len(records)} research papers indexed in Scopus."
    page = re.sub(r"<!-- stats:start -->.*?<!-- stats:end -->",
                  lambda m: f"<!-- stats:start -->{stats}<!-- stats:end -->", page, flags=re.S)
    path.write_text(page, encoding="utf-8")


PAGE = """<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Publications | Dr. Sarath S</title>
  <meta name="description" content="Complete publication list of Dr. Sarath S, Amrita Vishwa Vidyapeetham: __COUNT__ records from __FIRST__ to __LAST__ on thermal imaging, generative models and applied machine learning.">
  <link rel="canonical" href="https://drsaraths.github.io/publications.html">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#7b1e2e">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Public+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <nav class="nav container" aria-label="Main">
      <a class="brand" href="index.html">Dr. Sarath S</a>
      <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">Menu</button>
      <div class="nav-links">
        <a href="index.html#research">Research</a>
        <a href="index.html#current-work">Current work</a>
        <a href="index.html#teaching">Teaching</a>
        <a href="publications.html" aria-current="page">Publications</a>
        <a href="index.html#contact">Contact</a>
      </div>
    </nav>
  </header>

  <main id="main">
    <section class="page-head">
      <div class="container">
        <h1>Publications</h1>
        <p class="summary">__COUNT__ records from __FIRST__ to __LAST__. Scopus lists __CITES__ citations and an h-index of __H__.</p>
        <p>The list comes from a Scopus export. Citation counts reflect that export and will change over time.
          Profiles: <a href="https://scholar.google.com/citations?hl=en&user=gVkkGKgAAAAJ" target="_blank" rel="noopener">Google Scholar</a>,
          <a href="https://orcid.org/0000-0002-3009-3119" target="_blank" rel="noopener">ORCID</a>,
          <a href="https://www.scopus.com/authid/detail.uri?authorId=57195948861" target="_blank" rel="noopener">Scopus</a>.</p>
      </div>
    </section>

    <section class="filters" aria-label="Filter publications">
      <div class="container">
        <div class="filter-row">
          <input id="search" type="search" placeholder="Search title, author or venue" aria-label="Search publications">
          <select id="year-filter" aria-label="Filter by year">
            <option value="">All years</option>
__YEARS__
          </select>
          <select id="type-filter" aria-label="Filter by type">
            <option value="">All types</option>
            <option value="Journal article">Journal articles</option>
            <option value="Conference paper">Conference papers</option>
          </select>
          <button type="button" id="reset-filters">Reset</button>
        </div>
        <p class="filter-count" id="filter-count" aria-live="polite"></p>
      </div>
    </section>

    <section class="pub-list">
      <div class="container">
__GROUPS__
        <p class="no-results" id="no-results">No publications match. Try fewer words or reset the filters.</p>
      </div>
    </section>
  </main>

  <footer>
    <div class="container footer-inner">
      <span>&copy; <span data-current-year></span> Dr. Sarath S</span>
      <span>Amrita Vishwa Vidyapeetham, Amritapuri</span>
    </div>
  </footer>

  <script src="script.js"></script>
  <script src="publications.js"></script>
</body>
</html>
"""


def build_publications(records):
    years = sorted({r["year"] for r in records}, reverse=True)
    groups = []
    for y in years:
        rows = "\n".join(full_row(r) for r in records if r["year"] == y)
        groups.append(f'        <section class="year-group" aria-labelledby="y{y}">\n'
                      f'          <h2 id="y{y}">{y}</h2>\n          <div>\n{rows}\n          </div>\n        </section>')
    out = (PAGE.replace("__COUNT__", str(len(records)))
               .replace("__FIRST__", str(years[-1])).replace("__LAST__", str(years[0]))
               .replace("__CITES__", str(sum(r["cites"] for r in records)))
               .replace("__H__", str(h_index(records)))
               .replace("__YEARS__", "\n".join(f'            <option value="{y}">{y}</option>' for y in years))
               .replace("__GROUPS__", "\n".join(groups)))
    (ROOT / "publications.html").write_text(out, encoding="utf-8")


if __name__ == "__main__":
    data = load()
    build_publications(data)
    build_index(data)
    print(f"Built publications.html and index.html from {len(data)} records.")
