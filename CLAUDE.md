# CLAUDE.md — Project Briefing

This file is the primary briefing document for AI assistants working on this project.
Read this before making any changes.

---

## Dual Purpose

This project serves two simultaneous goals:

1. **Client Delivery** — Build and ship the Synchron Logistics website
2. **Template Foundation** — Establish the master `astro-template` pattern for Omnia Marketing's future client projects

When making architectural decisions, consider both purposes. Patterns introduced here will be replicated across future client sites. Prefer clarity and reusability over one-off shortcuts.

---

## Client

- **Business:** Synchron Logistics
- **Location:** Vancouver, BC, Canada
- **Industry:** Logistics / Transportation
- **CMS:** None — fully static site

All client-specific details live in `site.config.js`. **Do not hardcode business details in components.**

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Astro 4 |
| Output mode | `hybrid` — pages prerendered static; only API routes run server-side |
| Server adapter | `@astrojs/cloudflare` (Cloudflare Pages Functions) |
| Styling | Tailwind CSS 3 |
| Deployment | Cloudflare Pages |
| Email (forms) | Resend (`resend` pkg) — contact + carrier forms wired |
| CMS | None |
| Database | None |

> **Stack note (established pattern):** This was a fully static site until form
> handling was needed. The reusable pattern for any client site that needs forms:
> add `@astrojs/cloudflare`, set `output: 'hybrid'` in `astro.config.mjs`, and mark
> each API route with `export const prerender = false`. Pages stay static; only the
> endpoints become Cloudflare Pages Functions. See `CONVENTIONS.md → Server Endpoints
> & Form Handling`.

---

## Active Modules

Controlled via `modules` export in `site.config.js`:

| Module | Status | Notes |
|---|---|---|
| `contactForm` | Active | Wired to Resend via `/api/contact`; all → `info@`, differentiated by subject line |
| `carriers` | Active | `/carriers` page built; carrier application form wired via `/api/carrier` |
| `tracking` | Active | UI placeholder — portal URL pending from client |
| `industries` | Active | Industries grid on `/services` page |
| `blog` | Off | Not needed for this client |
| `gallery` | Off | Not needed for this client |
| `testimonials` | Off | Not needed for this client |
| `cms` | Off | Static site only |

---

## Pages

| Route | File | Status |
|---|---|---|
| `/` | `src/pages/index.astro` | Built — hero, Asia Pacific strip, origin/mission, services, stats, red CTA |
| `/about` | `src/pages/about.astro` | Built — origin story, vision, mission, compliance, IATA/FMC accreditations |
| `/services` | `src/pages/services.astro` | Built — alternating split layout, 4 groups, real images, industries grid |
| `/contact` | `src/pages/contact.astro` | Built — form wired to Resend (`/api/contact`), all → `info@` (subject-line differentiated), client+server validation, honeypot |
| `/tracking` | `src/pages/tracking.astro` | Built — honest placeholder; portal URL pending from client |
| `/carriers` | `src/pages/carriers.astro` | Built — full partnership page + carrier application form wired to Resend (`/api/carrier`), honeypot |

### API Routes (server-side, `prerender = false`)

| Route | File | Purpose |
|---|---|---|
| `/api/contact` | `src/pages/api/contact.ts` | Contact form → Resend; routes by inquiry type; Reply-To = submitter |
| `/api/carrier` | `src/pages/api/carrier.ts` | Carrier application → Resend → `info@`; Reply-To = applicant |

Shared email plumbing (Resend client, env handling, validation, HTML body) lives in
`src/lib/mail.ts` — build new form endpoints on top of it, do not duplicate.

---

## Current Build Status

- Design system established (tokens, fonts, component patterns)
- All 6 pages built with real content and layout
- `.gitignore` in place — node_modules and build artifacts excluded
- Animations: scroll reveal, hero stagger, counter (1000 and 10 only), hover states
- Nav and Footer built, responsive, null-safe for missing phone/address
- All business details in `site.config.js` — no hardcoded strings in components
- Services page: full alternating split layout with 4 real client images
- Contact form: wired to Resend (`/api/contact`) — server + client validation, success/error states, all → `info@` (differentiated by subject line), honeypot spam drop
- Carrier application form: built on `/carriers`, wired to Resend (`/api/carrier`) — single Carrier ID (type MC/DOT/Other + number; format adapts: MC=6 digits, DOT=9 digits, Other=free text) client + server; email required, contact number optional; collects applicant email for Reply-To; honeypot spam drop
- Stack moved from fully static → `hybrid` (Cloudflare adapter) so API routes run server-side; pages remain static
- Hero: "SUPPLY CHAIN EXCELLENCE." headline, background video (`synchron-logistics-hero-loop.mp4`) with jpg poster/fallback image, gated playback (desktop + motion-allowed only), headline text-shadow for legibility, CTA "EXPLORE SERVICES"
- Gateway section: 3-column layout (headline left, two stats right); mobile-friendly side-by-side stats, left-aligned stack
- Homepage services cards: still using Unsplash placeholder images — client assets needed
- Missing from client: phone, street address, postal code, social URLs, tracking portal URL

---

## Rules for This Project

1. **Always read `site.config.js` and `CONVENTIONS.md` before writing any new component or page.**

2. **No hardcoded business details.** All contact info, names, taglines, and copy that varies per client must live in `site.config.js`.

3. **Follow the design conventions in `CONVENTIONS.md` exactly.** No new colors without adding them to `tailwind.config.mjs`. No border-radius on buttons or inputs (sharp aesthetic).

4. **Mobile-first.** Write base styles for mobile, then layer `md:` and `lg:` breakpoints.

5. **Respect `prefers-reduced-motion`.** Wrap all non-trivial CSS animations in `@media (prefers-reduced-motion: no-preference)`.

6. **No new features before existing placeholders are resolved.** The contact form must be wired to Resend before adding new form fields. The tracking page must be scoped before adding tracking logic.

7. **Keep `Layout.astro` lean.** Global scripts and styles only — no page-specific logic in the layout.

8. **Do not create new files unnecessarily.** Prefer editing existing components to adding new ones.

9. **Confirm real client details before launch.** Phone, street address, postal code, and social links in `site.config.js` are still `null` / `#` placeholders — all marked with `// TODO: MISSING`. Stats (2015, 1,000+, 10 industries, 24/7/365) are confirmed real values. Flag any remaining placeholder data before merging to production.

10. **This is a template foundation.** Any pattern established here should be documented in `CONVENTIONS.md`. If a pattern is one-off and not reusable, note that explicitly.

---

## Key Files

| File | Purpose |
|---|---|
| `site.config.js` | Client config — business details, email routing, `mail.from`/`mail.to`, module toggles |
| `astro.config.mjs` | `hybrid` output + Cloudflare adapter |
| `src/lib/mail.ts` | Shared email plumbing (Resend client, env, validation, HTML body) — used by all form endpoints |
| `src/pages/api/contact.ts` | Contact form endpoint |
| `src/pages/api/carrier.ts` | Carrier application endpoint |
| `.env` / `.env.example` | `RESEND_API_KEY` (dev); `.env` gitignored, `.env.example` committed |
| `tailwind.config.mjs` | Design tokens — colors and fonts |
| `src/layouts/Layout.astro` | Base HTML shell, global styles, global scripts |
| `src/components/Nav.astro` | Site navigation |
| `src/components/Footer.astro` | Site footer |
| `CONVENTIONS.md` | Design system and coding conventions |
| `ROADMAP.md` | What's built, in progress, and still needed |
| `AGENCY.md` | Omnia agency dashboard integration (pending) |

---

## Resend Integration (Implemented)

Both the contact form (`/contact`) and the carrier application form (`/carriers`)
are wired to Resend for email delivery.

**Configuration (all in `site.config.js`, never hardcoded):**
- `mail.from` — `noreply@synchronlogistics.com` (domain verified in Resend)
- `mail.to` — `info@synchronlogistics.com` (single destination for ALL submissions)

**API key:** `RESEND_API_KEY`. In production it is read from `locals.runtime.env`
(Cloudflare Pages env vars, set for Production + Preview); in dev it is read from
`.env` via `import.meta.env`. The key is never hardcoded. See `src/lib/mail.ts → getResend()`.

**Routing (single destination):** every submission — contact AND carrier, regardless
of inquiry type — goes to `mail.to` (`info@`). Reply-To = the submitter's email on both
forms. The inquiry type is still shown in the email body. Triage happens via the subject
line, not the recipient:
- Contact, General → `New Contact Inquiry (General) — [First Last]`
- Contact, Sales & Quotes → `New Quote Request (Sales) — [First Last]`
- Contact, Carrier Inquiries → `New Carrier Inquiry — [First Last]`
- Carrier application → `New Carrier Application — [First Last]`

> The `emails.{general,sales,accounting}` map in `site.config.js` is no longer used for
> contact routing (kept for other references like the carriers payment section). Subject
> lines, not recipients, differentiate submissions.

**Validation:** every field is validated on BOTH client (inline errors) and server
(`/api/*` returns `{ ok, error, fields }`). The carrier form collects a single Carrier
ID — the applicant picks a type (MC / DOT / Other) and enters one number; the format
check adapts to the type (MC = 6 digits, DOT = 9 digits, Other = free text). On the
carrier form email is required and contact number is optional.

**Spam protection (honeypot):** both forms render a hidden `company_website` field
(see `HONEYPOT_FIELD` in `src/lib/mail.ts`). If it arrives non-empty, the endpoint
silently returns a success response WITHOUT sending — the bot thinks it worked and
doesn't retry. It is never treated as a validation error.

**To add another form:** create `src/pages/api/<name>.ts` with `export const prerender = false`,
import the shared helpers from `src/lib/mail.ts`, and POST to it from the page via `fetch`.
