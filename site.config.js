/**
 * site.config.js
 * Central source of truth for all client business details and module toggles.
 * This is the first file to update when onboarding a new client.
 */

export const site = {
  // ─── Business Identity ────────────────────────────────────────────────────
  name: 'Synchron Logistics',
  nameShort: 'Synchron',
  tagline: 'Driven by purpose. Fueled by opportunity.',
  description:
    'Synchron Logistics provides full-service international freight forwarding, inland distribution, and supply chain logistics support — coast to coast and worldwide.',
  founded: 2015,
  copyrightYear: 2026,

  // ─── Credentials ──────────────────────────────────────────────────────────
  credentials: {
    iata: true,                 // IATA Accredited Agent
    fmcNvocc: true,             // FMC-Registered NVOCC
    display: 'IATA Accredited Agent · FMC-Registered NVOCC',
  },

  // ─── Contact Details ──────────────────────────────────────────────────────
  // TODO: phone — MISSING, client has not provided
  phone: null,
  phoneHref: null,

  email: 'info@synchronlogistics.com',

  // TODO: address — MISSING, client has not provided street/postal
  address: {
    street: null,       // TODO: MISSING — confirm with client
    city: 'Vancouver',
    province: 'BC',
    postal: null,       // TODO: MISSING — confirm with client
    country: 'Canada',
    full: null,         // TODO: MISSING — update when street + postal confirmed
  },

  // ─── Routed Email Addresses ───────────────────────────────────────────────
  // Used for contact form routing (Resend integration). Do not hardcode
  // these strings in components — always import from site.config.js.
  emails: {
    general:    'info@synchronlogistics.com',
    sales:      'sales@synchronlogistics.com',
    accounting: 'accounting@synchronlogistics.com',
  },

  // ─── Transactional Mail (Resend) ──────────────────────────────────────────
  // Envelope addresses for form submissions sent via Resend. The API key is
  // read from the RESEND_API_KEY environment variable — NEVER hardcoded.
  // `from` must be on a domain verified in Resend. `to` is the default
  // recipient (carrier applications + fallback); the contact form additionally
  // routes by inquiry type using the `emails` map above.
  mail: {
    from: 'noreply@synchronlogistics.com',
    to:   'info@synchronlogistics.com',
  },

  // ─── Social Media ─────────────────────────────────────────────────────────
  // TODO: Replace '#' with real URLs before launch — all MISSING
  social: {
    facebook:  '#', // TODO: MISSING
    twitter:   '#', // TODO: MISSING
    linkedin:  '#', // TODO: MISSING
    instagram: '#', // TODO: MISSING
  },

  // ─── SEO Defaults ─────────────────────────────────────────────────────────
  seo: {
    defaultTitle: 'Synchron Logistics — Global Freight & Supply Chain Solutions',
    titleSuffix: ' — Synchron Logistics',
    defaultDescription:
      'Synchron Logistics offers international freight forwarding, road transportation, warehousing, and supply chain solutions from Vancouver, BC — gateway to Asia Pacific.',
  },

  // ─── Navigation ───────────────────────────────────────────────────────────
  nav: {
    links: [
      { label: 'HOME',      href: '/' },
      { label: 'SERVICES',  href: '/services' },
      {
        label: 'CARRIERS',
        href: '/carriers',
        children: [
          { label: 'Carrier Application', href: '/carriers#carrier-application' },
        ],
      },
      { label: 'ABOUT US',  href: '/about' },
      { label: 'TRACKING',  href: '/tracking' },
      { label: 'CONTACT',   href: '/contact' },
    ],
    ctaLabel: 'GET A QUOTE',
    ctaHref: '/contact',
  },

  // ─── Footer ───────────────────────────────────────────────────────────────
  footer: {
    tagline:
      'Full-service freight forwarding, inland distribution, and supply chain logistics support. Founded 2015, Vancouver, BC.',
    navLinks: [
      { label: 'Home',           href: '/' },
      { label: 'About Us',       href: '/about' },
      { label: 'Services',       href: '/services' },
      { label: 'Carriers',       href: '/carriers' },
      { label: 'Track Shipment', href: '/tracking' },
      { label: 'Contact',        href: '/contact' },
    ],
    serviceLinks: [
      { label: 'Air Freight',               href: '/services' },
      { label: 'Ocean Freight',             href: '/services' },
      { label: 'Road Transportation',       href: '/services' },
      { label: 'Drayage',                   href: '/services' },
      { label: 'Warehousing & Distribution', href: '/services' },
      { label: 'Supply Chain Consulting',   href: '/services' },
    ],
    legalLinks: [
      { label: 'Privacy Policy',    href: '/privacy' },
      { label: 'Terms of Service',  href: '/terms' },
      { label: 'Sitemap',           href: '/sitemap.xml' },
    ],
  },
};

// ─── Module Toggles ─────────────────────────────────────────────────────────
// Enable/disable optional site features. Toggling false hides the module
// but does not remove its code — it simply stops rendering.
export const modules = {
  contactForm:  true,   // Contact form with Resend email delivery (UI built; backend pending)
  carriers:     true,   // Carrier partnership page (/carriers)
  tracking:     true,   // Shipment tracking page (UI placeholder — Synch101 portal pending)
  industries:   true,   // Industries grid section on /services
  blog:         false,  // Blog / news section
  gallery:      false,  // Photo gallery
  testimonials: false,  // Customer testimonials
  cms:          false,  // CMS integration (Sanity, Contentful, etc.)
};

export default { site, modules };
