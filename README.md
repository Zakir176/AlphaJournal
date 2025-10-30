# AlphaJournal

A polished landing site for a personal trading journal application featuring animated hero, parallax background, feature and pricing sections, and a contact form. The UI is optimized for a dark-only theme with Apple-inspired aesthetics and smooth interactions.

## Live Overview
- Animated hero with MacBook-style app preview
- Parallax background layers and floating accent elements
- Features grid and pricing tiers with hover elevation and accent borders
- Contact section with form validation
- Chart.js line chart with dark theme styling

## Tech Stack
- HTML, CSS (vanilla, custom properties), JavaScript (vanilla)
- Chart.js (via CDN)

## Project Structure
```
AlphaJournal/
├─ index.html
├─ public/
│  ├─ css/
│  │  └─ style.css
│  ├─ js/
│  │  └─ app.js
│  └─ assets/
│     └─ images/
│        ├─ layer-bg.jpg
│        ├─ layer-fore.png
│        └─ layer-mid.png
└─ README.md
```

## Getting Started
1) Open index.html in your browser
- Double-click index.html, or serve the folder via any static file server.

2) Optional: Run a simple static server
- Python 3: `python -m http.server 8080`
- Node (serve): `npx serve -l 8080`
- Open: http://localhost:8080

## Dark-only Mode
This project intentionally ships as dark-only.
- The theme toggle UI and code are removed.
- CSS exposes a single dark palette via `:root` custom properties.
- Buttons, cards, and sections are tuned for high contrast on dark backgrounds.
- Chart.js is initialized with dark colors by default.

If you previously had the site cached, hard-refresh the browser (Ctrl+F5/Cmd+Shift+R).

## Key Files
- index.html
  - Contains all sections: navbar, hero, features, pricing, contact, and parallax/floating elements.
- public/css/style.css
  - Global dark theme variables under `:root`
  - Navigation, hero, features, pricing, and contact styling
  - Enhanced hover effects for `.feature-card` and `.pricing-card`
  - Button system: `.nav-cta`, `.cta-btn`, `.pricing-btn` with focus/hover/disabled states
- public/js/app.js
  - Navigation menu behavior (hamburger, close on link click)
  - Parallax movement for background layers
  - Chart.js setup (dark-only)
  - IntersectionObserver animations for cards and stat counters
  - Smooth scrolling for anchors

## Customization
- Colors: edit the CSS custom properties in `:root` to adjust brand accents or dark palette.
- Cards: tweak hover elevation, border accents, and transitions in `.feature-card` and `.pricing-card`.
- Buttons: adjust `.cta-btn`, `.nav-cta`, `.pricing-btn` for alternative styles.
- Chart: modify data/labels in `initChart()` inside `public/js/app.js`.

## Accessibility & UX
- Focus rings for all button variants (`:focus-visible`) are enabled.
- Animations use easing and durations that respect performance.
- Hover states provide clear affordances on interactive elements.

## Notes
- The contact form uses client-side validation only and does not submit to a backend.
- All assets and dependencies are loaded locally or via CDN (Chart.js).

## Roadmap Ideas
- Add an actual journal app SPA (e.g., React/Vue/Svelte) behind the landing page.
- Integrate a form backend or serverless function for contact submissions.
- Add content management (e.g., simple JSON or headless CMS) for marketing copy.
- Performance budget: image optimization and code splitting if expanded.

## License
MIT © 2025 AlphaJournal