import type { APIRoute } from 'astro';
import { site } from '../../../site.config.js';
import { getResend, json, EMAIL_RE, renderEmail, isHoneypotTripped } from '../../lib/mail';

// Run server-side as a Cloudflare Pages Function (hybrid output).
export const prerender = false;

const TYPE_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  sales: 'Sales & Quotes',
  carrier: 'Carrier Inquiries',
};

// Distinct subject lines so info@ can be triaged without opening each email.
function subjectFor(inquiryType: string, name: string): string {
  switch (inquiryType) {
    case 'sales':
      return `New Quote Request (Sales) — ${name}`;
    case 'carrier':
      return `New Carrier Inquiry — ${name}`;
    case 'general':
    default:
      return `New Contact Inquiry (General) — ${name}`;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot: silently accept (no email) so bots think it worked and don't retry.
  if (isHoneypotTripped(data)) {
    return json({ ok: true, message: "Thanks — we'll be in touch shortly." });
  }

  const get = (k: string) => (typeof data[k] === 'string' ? data[k].trim() : '');
  const firstName = get('firstName');
  const lastName = get('lastName');
  const email = get('email');
  const company = get('company');
  const service = get('service');
  const message = get('message');
  const inquiryType = get('inquiryType') || 'general';

  // Server-side validation — never trust the client.
  const fields: Record<string, string> = {};
  if (!firstName) fields.firstName = 'First name is required.';
  if (!lastName) fields.lastName = 'Last name is required.';
  if (!email) fields.email = 'Email is required.';
  else if (!EMAIL_RE.test(email)) fields.email = 'Enter a valid email address.';
  if (!message) fields.message = 'Message is required.';

  if (Object.keys(fields).length) {
    return json({ ok: false, error: 'Please correct the highlighted fields.', fields }, 400);
  }

  const typeLabel = TYPE_LABELS[inquiryType] || 'General Inquiry';

  const resend = getResend(locals);
  if (!resend) {
    return json({ ok: false, error: 'Email service is not configured. Please try again later.' }, 500);
  }

  const rows: Array<[string, string]> = [
    ['Inquiry Type', typeLabel],
    ['Name', `${firstName} ${lastName}`],
    ['Email', email],
    ['Company', company || '—'],
    ['Service Needed', service || '—'],
    ['Message', message],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  try {
    const { error } = await resend.emails.send({
      from: site.mail.from,
      to: site.mail.to,
      replyTo: email,
      subject: subjectFor(inquiryType, `${firstName} ${lastName}`),
      text,
      html: renderEmail(`New ${typeLabel} — ${site.name}`, rows),
    });
    if (error) {
      console.error('Resend error (contact):', error);
      return json({ ok: false, error: 'Could not send your message. Please try again.' }, 502);
    }
  } catch (err) {
    console.error('Resend threw (contact):', err);
    return json({ ok: false, error: 'Could not send your message. Please try again.' }, 502);
  }

  return json({ ok: true, message: "Thanks — we'll be in touch shortly." });
};
