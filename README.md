# Smart Weather & Travel Dashboard

Search any city to get live weather, a 7-day forecast with animated icons, and travel suggestions based on the conditions. Built with HTML, CSS and vanilla ES6+ JavaScript using the free Open-Meteo API (no key needed).

## Run
Open `index.html`, or run `python -m http.server 8000` and visit `http://localhost:8000`.

## Structure
```
index.html
css/style.css
js/icons.js    weather code -> animated SVG icon
js/travel.js   travel score and suggestions
js/app.js      API calls, validation, rendering
REPORT.md      project report
```

## Deploy (GitHub Pages)
Push to GitHub, then Settings > Pages > Deploy from branch > `main` / root. Your site will be at `https://<username>.github.io/<repo>/`.

## Suggested commits
1. `chore: set up project structure`
2. `feat: add city search with input validation`
3. `feat: integrate Open-Meteo geocoding and forecast with async/await`
4. `feat: show current weather and 7-day forecast`
5. `feat: add animated SVG weather icons and sky themes`
6. `feat: add travel scoring, suggestions and packing list`
7. `feat: add recent searches and unit toggle`
8. `style: make layout responsive for mobile`
9. `docs: add README and project report`
