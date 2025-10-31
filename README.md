# AlphaJournal

A polished landing site and an in-browser Trading Journal app. The landing page showcases the product, and the journal app (public/journal.html) provides local-only trade tracking with a modern Apple-inspired light/dark UI.

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
├─ index.html                      # Marketing/landing page
├─ public/
│  ├─ journal.html                 # Trading Journal single-page app shell
│  ├─ css/
│  │  ├─ style.css                 # Landing page styles
│  │  └─ journal.css               # Trading Journal styles (light/dark themes)
│  ├─ js/
│  │  ├─ app.js                    # Landing page interactions
│  │  └─ journal.js                # Trading Journal logic (class-based)
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

## Themes
- Landing page remains visually dark-first.
- Trading Journal supports light and dark themes controlled via a toggle. The selection is persisted to localStorage (key: `theme`).
- journal.css defines both palettes via CSS custom properties on [data-theme="light"|"dark"].

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
  - Chart.js setup (dark-oriented)
  - IntersectionObserver animations for cards and stat counters
  - Smooth scrolling for anchors
- public/journal.html
  - App shell with sidebar navigation (Dashboard, Trade Log, Analytics, Calendar, Settings)
  - Edit modal for updating trades
  - Uses ../css/journal.css and ../js/journal.js
- public/css/journal.css
  - Reset and base styles, Apple-inspired glassmorphism
  - Light/Dark theme tokens, responsive grid, cards, modals, empty state, utilities
- public/js/journal.js
  - Class TradingJournal implementing localStorage-backed CRUD
  - Features: add/edit/delete trades, filters (profit/loss), sorting, CSV export, image preview, stats, notifications, theme toggle

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
- Trading data is stored in the browser's localStorage (`tradingEntries`). No server storage.

## Roadmap Ideas
- Dashboard widgets fed by journal data (charts, win-rate, profit factor)
- Cloud sync/auth (optional) while keeping offline-first UX
- Import from CSV and broker exports; richer export formats (XLSX/JSON)
- Drag-and-drop image uploads and gallery view
- Advanced analytics with charts; calendar heatmap of P/L
- Form backend or serverless function for contact submissions
- Content management for marketing copy; performance budget and code splitting if expanded

## License
MIT © 2025 AlphaJournal