# drsaraths.github.io

Academic website for Dr. Sarath S, Amrita Vishwa Vidyapeetham, Amritapuri.

Plain HTML, CSS and JavaScript. No framework and no build step is needed to host it.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Home page: about, research, current work, teaching, selected publications, contact |
| `publications.html` | Full publication list with search, year and type filters (generated) |
| `data/publications.json` | The 38 Scopus records, cleaned. This is the source for the publication list |
| `tools/build.py` | Rebuilds `publications.html` and the selected list on `index.html` from the JSON |
| `style.css`, `script.js`, `thermal.js`, `publications.js` | Styles and behaviour |
| `404.html`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `.nojekyll` | Hosting and search-engine files |

## Publish on GitHub Pages

1. Put every file in this folder at the root of the repository `drsaraths.github.io`.
2. In the repository, open Settings, then Pages. Choose the `main` branch and the `/ (root)` folder.
3. The site appears at `https://drsaraths.github.io/` within a minute or two.

## Use your own domain

1. In Settings, then Pages, enter the domain under Custom domain. GitHub creates a `CNAME` file.
2. At your domain registrar, add the DNS records that GitHub lists on that page.
3. Replace `https://drsaraths.github.io/` with your domain in `index.html` (canonical link, `og:url`, JSON-LD), `publications.html` (canonical link, generated from `tools/build.py`), `robots.txt` and `sitemap.xml`.
4. Turn on Enforce HTTPS once the certificate is ready.

## Show an email address

Open `script.js` and put your address in `EMAIL` on line 5. The Contact section shows it once it is set. While the value is empty, the email line stays hidden.

## Update the publications

1. Edit `data/publications.json`. Add a record, or set `"selected": true` to feature a paper on the home page.
2. Run `python3 tools/build.py` from the repository root.
3. Commit and push.

Citation counts come from the Scopus export and do not update by themselves.

## Edit the text

Research, current work, teaching and contact text lives in `index.html`. The fonts (Newsreader and Public Sans) load from Google Fonts. Colours and spacing are variables at the top of `style.css`.
