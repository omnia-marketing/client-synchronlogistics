# Roadmap

Build status for the Synchron Logistics website.

---

## Already Built

### Infrastructure
- [x] Astro 4 project scaffold
- [x] Tailwind CSS integration with custom design tokens (brand-red, brand-dark, brand-light)
- [x] Google Fonts loaded (Barlow Condensed, Barlow)
- [x] `Layout.astro` base shell with global styles and scripts
- [x] `site.config.js` — central client config (business details, module toggles, email routing, credentials)
- [x] `tailwind.config.mjs` — design token definitions
- [x] `.gitignore` — excludes node_modules, .astro, dist, .env, .DS_Store

### Documentation
- [x] `CLAUDE.md` — project briefing for AI assistants (stack, modules, pages, rules)
- [x] `CONVENTIONS.md` — design system, Tailwind patterns, component conventions, naming rules
- [x] `ROADMAP.md` — build status tracking
- [x] `AGENCY.md` — placeholder for Omnia dashboard integration spec (not yet built)
- [x] `references/README.md` — folder for section design screenshots (empty until sections finalised)

### Components
- [x] `Nav.astro` — top bar (conditional phone), sticky nav, desktop links, mobile hamburger. Pulls from site.config.js. Null-safe for missing phone.
- [x] `Footer.astro` — 4-column layout. Credentials line (IATA/FMC). Null-safe for missing phone/address.

### Pages
- [x] `index.astro` — Hero ("Supply Chain Excellence", white-stroke outline headline, background video `synchron-logistics-hero-loop.mp4` with jpg poster/fallback, gated playback), Asia Pacific differentiator strip — 3-column layout (headline left, two stats side-by-side right; stacks to left-aligned column on mobile), Origin/Mission section, Services (3 cards — Unsplash placeholders), Stats bar (2015 static / 1,000+ / 10 / 24/7), Red CTA
- [x] `about.astro` — Page header (IATA/FMC in intro), Origin story, Vision + Mission, Compliance section, Accreditations section
- [x] `services.astro` — Page header, 4-group alternating split layout (image + content, full-bleed), real client images wired, Industries We Serve grid (10 industries, 5-col), CTA
- [x] `contact.astro` — Contact info (null-safe), Quote form with inquiry type dropdown (email routing comments in place)
- [x] `tracking.astro` — Honest placeholder: portal context, portal features preview, Contact CTA
- [x] `carriers.astro` — Hero, Why Partner, Owner-Operators, Payment Terms, What We Look For, Apply CTA (placeholder link)

### Images
- [x] `/public/images/` directory created
- [x] `synchron-logistics-supply-chain-excellence.jpg` — hero poster/fallback image
- [x] `synchron-logistics-hero-loop.mp4` — hero background video loop
- [x] `synchron-logistics-domestic-freight.jpg` — wired to Group 01
- [x] `synchron-logistics-international-freight.jpg` — wired to Group 02
- [x] `synchron-logistics-warehouse-distribution.jpg` — wired to Group 03
- [x] `synchron-logistics-value-added-services.jpg` — wired to Group 04

### Animations
- [x] Hero page-load stagger (fade-slide-up, CSS keyframes, 5-element stagger)
- [x] Hero infinite float
- [x] Hero background video — gated playback (desktop ≥768px + motion-allowed only, `preload="none"`, fade-in on `canplay`)
- [x] Scroll reveal (`.reveal` class, IntersectionObserver, respects `prefers-reduced-motion`)
- [x] Counter animation — `1000` and `10` only; `2015` and `24/7` are static
- [x] Nav scroll shadow
- [x] Industries grid: icon + label colour transition on hover
- [x] Read more arrow shift on hover

### Content
- [x] Founded year: 2015
- [x] Stats: 2015 (static) / 1,000+ carriers / 10 industries / 24/7/365
- [x] Asia Pacific stats: 2nd busiest airport in Canada / Largest port in Canada
- [x] Gateway section stat styling — all white on "2nd" and "Largest", no red on stats
- [x] Gateway section layout — redesigned to 3-column grid (headline / stat 1 / stat 2); stats side-by-side on mobile, left-aligned column stack
- [x] Hero headline — "SUPPLY CHAIN" (outline) / "EXCELLENCE." (solid white)
- [x] Hero CTA — updated from "OUR SERVICES" to "EXPLORE SERVICES"
- [x] Hero background image — moved to `/public/images/synchron-logistics-supply-chain-excellence.jpg`
- [x] Email routing: general / sales / accounting in site.config.js
- [x] IATA and FMC/NVOCC credentials: About page copy, About accreditations section, footer bottom bar
- [x] Mission: "Driven by purpose. Fueled by opportunity."
- [x] Vision: "To find challenging logistics solutions and make the improbable possible."
- [x] Compliance section: fraud prevention, human rights, conflicts of interest, antitrust
- [x] Services: 4 groups / 10 individual services across alternating split layout
- [x] Industries grid: 10 sectors with inline SVG icons
- [x] Carriers page: full carrier partnership content with payment terms

---

## In Progress

- [ ] **Placeholder contact details** — phone and street address MISSING. Marked with TODO in site.config.js. City/province (Kelowna, BC) confirmed.
- [ ] **Social media URLs** — all `#` in site.config.js. Client has not provided.
- [ ] **Carrier application link** — `/carriers` CTA points to `#`. Needs client-provided URL or form spec.
- [ ] **Tracking portal URL** — Synch101 app status and portal URL not yet confirmed.
- [ ] **Resend contact form** — form UI complete; API endpoint not yet built.

---

## Still Needed

### Content confirmation required
- [ ] Real phone number — update `site.phone` and `site.phoneHref` in site.config.js
- [ ] Real street address + postal code — update `site.address` in site.config.js
- [ ] Social media URLs — update `site.social` in site.config.js
- [ ] Carrier application form/link — update `/carriers` CTA `href`
- [ ] Tracking portal URL — update `tracking.astro` with real login link or embed
- [ ] **Homepage services section** — 3 cards still use Unsplash placeholder images; replace with client assets

### Features to build
- [ ] Resend contact form backend (`src/pages/api/contact.ts`)
  - Read `inquiryType` from form, map to correct email from site.config.js `emails`
  - Server-side validation
  - Success/error state handling in form UI
- [ ] Privacy Policy page (`/privacy`)
- [ ] Terms of Service page (`/terms`)
- [ ] 404 page
- [ ] Favicon + social share image (OG image)
- [ ] Sitemap (`@astrojs/sitemap` integration)

### Launch checklist
- [ ] Confirm and fill all `// TODO: MISSING` fields in site.config.js
- [ ] Wire contact form to Resend
- [x] Set up Cloudflare Pages deployment
- [ ] Set Resend API key in Cloudflare Pages environment variables
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Lighthouse audit (performance, accessibility, SEO)
- [ ] Cross-browser check (Chrome, Safari, Firefox, Edge)
