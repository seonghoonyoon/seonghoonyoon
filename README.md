# Joseph Yoon — Portfolio (scaffold)

This repository contains a minimal scaffold for an art portfolio.

Files added:

- `index.html` — homepage with featured works
- `projects.html` — grid of projects
- `about.html` — supporting pages (contact section merged)
- `assets/css/style.css` — base stylesheet
- `assets/img/*` — sample SVG placeholder artworks

To preview locally, open `index.html` in your browser or use a simple static server, for example:

```powershell
# from repository root
python -m http.server 8000
# then open http://localhost:8000/
```

Deployment to GitHub Pages
 - This repository is set up to deploy to GitHub Pages via GitHub Actions. The workflow is in `.github/workflows/deploy-pages.yml`.
 - To publish:
	 1. Create a GitHub repository named `seonghoonyoon.github.io` (if you haven't already) and push this repository to it.
	 2. Ensure the default branch is `main` and push: 

```bash
git remote add origin https://github.com/<your-username>/seonghoonyoon.github.io.git
git branch -M main
git add -A
git commit -m "initial"
git push -u origin main
```

 - Once pushed, the Actions workflow will run and deploy the site automatically. If you want a custom domain, add a `CNAME` file at the repository root and configure DNS.

