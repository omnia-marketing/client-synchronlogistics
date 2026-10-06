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

export type FormResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fields?: Record<string, string> };

/**
 * Read a form submission. Accepts JSON (the normal `fetch` path) AND native
 * form posts (urlencoded / multipart). The native post is the fallback when the
 * page's script never ran — JS blocked or failed to load, or the visitor
 * submitted before it loaded. Without it, the browser would just reload the page
 * and the submission would be lost with no error.
 * Returns null if the body can't be parsed.
 */
export async function readSubmission(
  request: Request
): Promise<{ data: Record<string, string>; isJson: boolean } | null> {
  const type = request.headers.get('content-type') || '';
  try {
    if (type.includes('application/json')) {
      const body = await request.json();
      return body && typeof body === 'object' ? { data: body, isJson: true } : null;
    }
    const form = await request.formData();
    const data: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value === 'string') data[key] = value;
    });
    return { data, isJson: false };
  } catch {
    return null;
  }
}

/**
 * Reply in the format the submitter can use: JSON for `fetch`, or a minimal
 * standalone HTML page for a native form post (no JS on that path, so the result
 * has to be readable as-is). `backTo` is the form page to link back to.
 */
export function respond(isJson: boolean, result: FormResult, status: number, backTo: string): Response {
  if (isJson) return json(result, status);

  const heading = result.ok ? 'Thank you' : 'Your submission was not sent';
  const body = result.ok
    ? `<p>${escapeHtml(result.message)}</p>`
    : // Nothing is highlighted on this page, so list the field errors instead.
      `<p>${result.fields ? 'Please fix the following:' : escapeHtml(result.error)}</p>` +
      (result.fields
        ? `<ul>${Object.values(result.fields).map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`
        : '') +
      `<p>Use your browser's Back button to return to the form — your entries should still be there.</p>`;

  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${heading}</title></head>` +
    `<body style="font-family:Arial,Helvetica,sans-serif;color:#0a0a0a;max-width:560px;margin:64px auto;padding:0 16px;line-height:1.5;">` +
    `<h1 style="font-size:22px;border-bottom:3px solid #e31937;padding-bottom:8px;">${heading}</h1>` +
    body +
    `<p><a href="${escapeHtml(backTo)}" style="color:#e31937;">Return to the site</a></p>` +
    `</body></html>`;

  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

/** Pragmatic email format check — mirror this on the client too. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Name of the hidden honeypot field. Both forms render an input with this name,
 * hidden from humans via `display:none`. Legitimate users never fill it; many
 * bots do.
 *
 * NOTE: the field is named `contact_ref` (not something like `company_website`)
 * and hidden with `display:none` on purpose. A field named after a real autofill
 * token (website / company / url) and merely positioned off-screen gets filled by
 * browser autofill and password managers — silently dropping REAL submissions.
 * `display:none` is skipped by autofill; a neutral name isn't recognized by it.
 */
export const HONEYPOT_FIELD = 'contact_ref';

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
