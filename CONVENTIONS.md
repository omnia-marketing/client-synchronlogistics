# Conventions

Design patterns, Tailwind classes, and coding conventions for this project.
All new code must follow these rules to maintain visual and structural consistency.

---

## Design Tokens

Defined in `tailwind.config.mjs` and mirrored semantically in `site.config.js`.

| Token | Value | Usage |
|---|---|---|
| `brand-red` / `#e31937` | Primary accent | CTAs, hover states, active nav, icons |
| `brand-dark` / `#0a0a0a` | Near-black | Backgrounds (dark sections), body text, nav top bar |
| `brand-light` / `#f5f5f5` | Off-white | Section alternating backgrounds |
| `white` | `#ffffff` | Cards, form backgrounds, light sections |
| `gray-400` | Tailwind default | Body copy in dark sections |
| `gray-500` | Tailwind default | Body copy in light sections, labels |

**Always use Tailwind token names or the `#e31937` / `#0a0a0a` literals.** Do not introduce new hex values without adding them to `tailwind.config.mjs` first.

---

## Typography

| Role | Font | Class |
|---|---|---|
| Headings (H1–H6) | Barlow Condensed | `font-heading` |
| Body text | Barlow | `font-body` |

**Heading conventions:**
- All caps with `uppercase` class
- Bold with `font-bold`
- Tight leading: `leading-tight` or `leading-none`
- Large display sizes: `text-5xl` → `text-9xl` (responsive, mobile-first)
- Letter spacing on small labels: `tracking-widest`

**Body copy conventions:**
- `text-sm` or `text-base` with `leading-relaxed`
- Never exceed `text-lg` for paragraph body
- Section eyebrow labels: `font-heading font-bold text-sm tracking-widest uppercase text-[#e31937]`

---

## Layout

- Max content width: `max-w-7xl mx-auto px-6`
- All sections use `px-6` horizontal padding (scales naturally on mobile)
- Section vertical spacing: `py-24` (standard), `py-32` (hero/intro sections)
- Grid system: Tailwind grid with responsive breakpoints (`md:`, `lg:`)
- Mobile-first: start with single column, expand with `md:grid-cols-2 lg:grid-cols-3`, etc.

---

## Section Backgrounds (alternating pattern)

Sections alternate to create visual rhythm:

```
Dark  → #0a0a0a   (bg-[#0a0a0a])
Light → #f5f5f5   (bg-[#f5f5f5])
White → #ffffff   (bg-white)
```

---

## Components

### Buttons

**Primary (filled red):**
```html
<a class="font-heading font-bold uppercase tracking-widest text-sm px-8 py-4 bg-[#e31937] text-white hover:bg-[#c41530] hover:scale-[1.02] transition-all duration-200">
  LABEL
</a>
```

**Secondary (white outline — for dark backgrounds):**
```html
<a class="font-heading font-bold uppercase tracking-widest text-sm px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#0a0a0a] transition-all duration-200">
  LABEL
</a>
```

**No border-radius.** Buttons are deliberately sharp/squared — this is a core brand decision.

### Cards

Service cards use:
- White background on light sections
- `border border-gray-100` with `hover:border-[#e31937]` transition
- `p-8` internal padding
- Red accent rule: `<div class="w-8 h-0.5 bg-[#e31937] mb-6"></div>`

### Form Inputs

```html
<input class="w-full border border-gray-200 px-4 py-3 font-body text-sm focus:outline-none focus:border-[#e31937] transition-colors" />
```

Labels: `font-body text-xs uppercase tracking-widest text-gray-500 mb-2 block`

No border-radius on inputs — consistent with the sharp/industrial aesthetic.

### Section Eyebrow Label

Used before every major heading:
```html
<p class="font-heading font-bold text-sm tracking-widest uppercase text-[#e31937] mb-3">
  SECTION TITLE
</p>
```

---

## Animations

### Scroll Reveal

Add `.reveal` class to any section or element to trigger a fade-up on scroll.
Managed globally in `Layout.astro` via IntersectionObserver. Respects `prefers-reduced-motion`.

```html
<section class="bg-white py-24 reveal">
```

### Hero (page load stagger)

Hero content uses CSS animation classes defined in `index.astro`:
- `.hero-supply-chain` — first line, 0.1s delay
- `.hero-excellence` — second line, 0.3s delay
- `.hero-subtext` — 0.5s delay
- `.hero-buttons` — 0.7s delay
- `.hero-float` — infinite subtle float after 1.5s

### Hero Background Video (gated playback)

**Reusable pattern.** Autoplay background video that costs mobile and reduced-motion users nothing — they only ever see the fallback image.

Markup — fallback `<img>` first (handles first paint), `<video>` second, both decorative:

```html
<img
  src="/images/hero-poster.jpg"
  alt=""
  class="absolute inset-0 w-full h-full object-cover"
  aria-hidden="true"
/>
<video
  class="hero-video absolute inset-0 w-full h-full object-cover"
  muted loop playsinline preload="none" aria-hidden="true"
>
  <source src="/images/hero-loop.mp4" type="video/mp4" />
</video>
```

Page `<style>` — video starts invisible, fades in over the image when ready:

```css
.hero-video { opacity: 0; transition: opacity 0.8s ease; }
.hero-video.is-ready { opacity: 1; }
```

Page `<script>` — playback is JS-gated; the video never downloads unless both checks pass:

```js
const v = document.querySelector('.hero-video');
if (v) {
  const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 768px)').matches;
  if (!reduce && desktop) {
    v.preload = 'auto';
    v.addEventListener('canplay', () => v.classList.add('is-ready'), { once: true });
    v.play().catch(() => {});
  }
}
```

Rules:
- `preload="none"` on the video — combined with the JS gate, mobile and reduced-motion users never download it
- Play only when viewport is `min-width: 768px` **and** `prefers-reduced-motion` is not set
- Fade in via `.is-ready` on `canplay` — never show a black/loading video frame
- Both layers get `aria-hidden="true"` and empty/no `alt` — purely decorative
- Overlay and content stay above the video via DOM order (overlay `<div>` after the video)
- Text over video usually needs a layered `text-shadow` for legibility — soft, low-opacity layers read better than one heavy shadow (see hero headline in `index.astro`)

### Counter Animation

Stats section uses `data-counter` and `data-target` attributes.
Trigger is scoped to `#stats-section`. Managed in `Layout.astro`.

```html
<span data-counter data-target="99">99</span>
<span data-counter data-target="3.5" data-decimal="true">3.5</span>
```

### Hover States

- Nav links: `hover:text-[#e31937]`
- Service cards: `translateY(-4px)` lift + shadow
- Service card image: `scale(1.05)` zoom
- Read More arrow: `translateX(4px)` shift
- Value columns: number turns red, bottom line expands to 100% width

---

## Nav

- Top bar: dark (`#0a0a0a`) with phone and tagline
- Main nav: white, sticky (`sticky top-0 z-50`)
- Scroll shadow: adds `box-shadow` via JS class `.nav-scrolled` after 80px scroll
- Active state: `text-[#e31937]` — determined by `Astro.url.pathname`
- Mobile: hamburger icon animates to X on open

---

## Server Endpoints & Form Handling

**Established template pattern** for any client site that needs form handling
(contact, carrier, quote, etc.). Introduced when the Synchron contact + carrier
forms were wired to Resend.

### Stack setup (one-time per project)

The site stays static except for API routes:

1. Install `@astrojs/cloudflare` and `resend`.
2. In `astro.config.mjs`: set `output: 'hybrid'` and `adapter: cloudflare()`.
   - `hybrid` = every page prerenders to static HTML by default; only routes that
     opt out run server-side. Pages stay fast and CDN-cached.
3. Mark each API route with `export const prerender = false` so it runs as a
   Cloudflare Pages Function.

### Email plumbing — build it once

Shared helpers live in `src/lib/mail.ts`. **Do not re-create the Resend client,
env handling, validation, or response shape in each endpoint** — import from there.

- `getResend(locals)` — returns a Resend client. Reads the key from
  `locals.runtime.env.RESEND_API_KEY` in production (Cloudflare), falling back to
  `import.meta.env.RESEND_API_KEY` (`.env`) in dev. **Never hardcode the key.**
- `json(data, status)` — JSON `Response` helper.
- `EMAIL_RE` — shared email regex (mirror it on the client).
- `escapeHtml(value)` — escape user input before interpolating into the HTML body.
- `renderEmail(title, rows)` — render a labeled field list into a clean HTML body.
- `HONEYPOT_FIELD` / `isHoneypotTripped(data)` — shared spam check (see Honeypot below).

Envelope addresses (`mail.from`, `mail.to`) and routing addresses (`emails.*`) come
from `site.config.js` — never hardcode them in endpoints.

### Endpoint contract

Each endpoint accepts a JSON POST and returns:

```json
{ "ok": true,  "message": "Human-readable success" }
{ "ok": false, "error": "Summary", "fields": { "fieldName": "Inline message" } }
```

- Validate EVERY field server-side. Never trust client validation.
- Return `400` with a `fields` map for validation errors, `502` for send failures,
  `500` if the service is misconfigured (missing key).
- **Check the honeypot FIRST**, before validation or sending (see below).

### Honeypot (spam protection — include on every form by default)

Bots auto-fill every field they find. A honeypot is a decoy field hidden from humans;
if it comes back filled, the submission is almost certainly a bot.

- **Markup:** a real text input (NOT `type="hidden"` — bots skip those), visually
  hidden via CSS, wrapped in an `aria-hidden="true"` container, with `tabindex="-1"`
  and `autocomplete="off"` so humans never focus or autofill it. Hide it by moving it
  offscreen (`absolute -left-[9999px] w-px h-px overflow-hidden`), not `display:none`
  (some bots skip non-rendered fields). Use the shared `HONEYPOT_FIELD` name.

  ```html
  <div class="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
    <label>Company Website</label>
    <input type="text" name="company_website" tabindex="-1" autocomplete="off" />
  </div>
  ```

- **Server:** call `isHoneypotTripped(data)` as the very first step. If true, silently
  return a normal success response WITHOUT sending email — the bot believes it
  succeeded and won't retry. Never surface it as a validation error.
- **Client:** nothing special — the field rides along in `FormData` automatically and
  is not part of client validation.

### Triage by subject line, not recipient

Forms send all submissions to one inbox (`mail.to`). Differentiate submission types
with distinct, name-bearing **subject lines** (e.g. `New Quote Request (Sales) — Jane Doe`)
so the inbox can be triaged without opening each email. Keep any "type" field visible in
the body too. Prefer this over routing to multiple recipients.

### Form UI pattern

- `<form novalidate>` with an `id`; handle submit via `fetch` (no page reload).
- Each validated field gets a sibling `<p class="hidden ..." data-error-for="name">`
  for inline errors; a single `<p data-form-status role="status" aria-live="polite">`
  for the overall result.
- On submit: clear errors → client-validate → disable the submit button and swap its
  label (`SENDING…`) → POST → on `ok` reset the form and show success; otherwise map
  `result.fields` back to the inline error elements and show `result.error`.
- Mirror server validation rules on the client (e.g. MC = 6 digits, DOT = 9 digits),
  and also use HTML `pattern` + `inputmode="numeric"` for native hints.
- Form inputs follow the standard input styling (sharp, no radius, red focus border).

---

## File Structure Conventions

```
src/
  components/    # Reusable UI: Nav, Footer, etc.
  layouts/       # Page shells: Layout.astro
  pages/         # One file per route
site.config.js   # Client config — always update this first
tailwind.config.mjs
```

- **No hardcoded business details in components.** All contact info, names, and copy that may change per client must come from `site.config.js`.
- Component frontmatter imports use relative paths (`../../site.config.js`).
- Page-level `<style>` blocks are acceptable for page-specific animations/overrides.
- Global styles live in `Layout.astro`'s `<style is:global>` block only.

---

## Accessibility

- All interactive elements have `aria-label` where text is absent (icon buttons, hamburger)
- Images use descriptive `alt` text
- Animations respect `prefers-reduced-motion: no-preference` — wrap in that media query
- Form inputs have associated `<label>` elements
- Color contrast: white on `#e31937` passes AA; white on `#0a0a0a` passes AAA

---

## Naming Conventions

- Component files: `PascalCase.astro` (e.g. `Nav.astro`, `Footer.astro`)
- Page files: `kebab-case.astro` (e.g. `about.astro`, `contact.astro`)
- CSS class names on custom elements: `kebab-case` (e.g. `value-col`, `service-card`)
- JS variables in scripts: `camelCase`
- Config keys in `site.config.js`: `camelCase`
