/**
 * Shared email plumbing for all form endpoints (contact, carrier, future forms).
 * Build this once — endpoints import from here rather than re-creating the
 * Resend client, env handling, validation, or response shape.
 */
import { Resend } from 'resend';

/**
 * Resolve the Resend API key.
 * - Production (Cloudflare Pages): secrets are exposed on `locals.runtime.env`.
 * - Local dev (`astro dev`): read from `.env` via `import.meta.env`.
 * The key is NEVER hardcoded.
 */
export function getResend(locals: unknown): Resend | null {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env;
  const key = runtimeEnv?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

/** JSON response helper with the correct content-type. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Pragmatic email format check — mirror this on the client too. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Name of the hidden honeypot field. Both forms render an input with this name,
 * visually hidden from humans. Legitimate users never fill it; many bots do.
 */
export const HONEYPOT_FIELD = 'company_website';

/**
 * Returns true if the honeypot was tripped (non-empty) — i.e. the submission is
 * almost certainly a bot. Endpoints should silently return a success response
 * WITHOUT sending email when this is true, so bots think it worked and don't retry.
 */
export function isHoneypotTripped(data: Record<string, unknown>): boolean {
  const value = data[HONEYPOT_FIELD];
  return typeof value === 'string' && value.trim().length > 0;
}

/** Escape user-supplied values before interpolating into the HTML email body. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

/** Render a labeled field list into a clean, readable HTML email body. */
export function renderEmail(title: string, rows: Array<[string, string]>): string {
  const trs = rows
    .map(
      ([k, v]) =>
        `<tr>` +
        `<td style="padding:6px 14px 6px 0;font-weight:bold;vertical-align:top;white-space:nowrap;">${escapeHtml(k)}</td>` +
        `<td style="padding:6px 0;vertical-align:top;white-space:pre-wrap;">${escapeHtml(v)}</td>` +
        `</tr>`
    )
    .join('');
  return (
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#0a0a0a;max-width:560px;">` +
    `<h2 style="font-size:18px;border-bottom:3px solid #e31937;padding-bottom:8px;margin:0 0 16px;">${escapeHtml(title)}</h2>` +
    `<table style="border-collapse:collapse;font-size:14px;line-height:1.5;">${trs}</table>` +
    `</div>`
  );
}
