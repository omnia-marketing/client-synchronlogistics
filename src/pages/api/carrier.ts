import type { APIRoute } from 'astro';
import { site } from '../../../site.config.js';
import { getResend, json, readSubmission, respond, EMAIL_RE, renderEmail, isHoneypotTripped, HONEYPOT_FIELD } from '../../lib/mail';
import type { FormResult } from '../../lib/mail';

// Run server-side as a Cloudflare Pages Function (hybrid output).
export const prerender = false;

// MC and DOT numbers are digits only but are issued sequentially, so their
// length grows over time (DOT is ~7 digits today, MC 6–7). Accept 1–8 digits
// rather than an exact count — an exact count rejected real carriers.
const CARRIER_NUM_RE = /^\d{1,8}$/;

// Strip a typed prefix ("MC-", "USDOT #") and separators so "MC-123456" → "123456".
function normalizeCarrierNumber(value: string): string {
  return value.replace(/^(us\s*)?(mc|dot)/i, '').replace(/[\s#:.-]/g, '');
}

// Carrier ID type → display label. The applicant picks one and supplies a
// single ID number; the format check below adapts to the chosen type.
const ID_TYPE_LABELS: Record<string, string> = { mc: 'MC', dot: 'DOT', other: 'Other' };

export const POST: APIRoute = async ({ request, locals }) => {
  const submission = await readSubmission(request);
  if (!submission) return json({ ok: false, error: 'Invalid request body.' }, 400);
  const { data, isJson } = submission;
  // JSON for the fetch path; a plain HTML page for a no-JS native form post.
  const reply = (result: FormResult, status = 200) => respond(isJson, result, status, '/carriers/');

  // Honeypot: silently accept (no email) so bots think it worked and don't retry.
  // Log the trip so drops are visible in Cloudflare tail logs — a real user's
  // browser autofilling this field would otherwise vanish without a trace.
  if (isHoneypotTripped(data)) {
    console.warn(`Honeypot tripped (carrier) — dropped without sending. ${HONEYPOT_FIELD}=`, data[HONEYPOT_FIELD]);
    return reply({ ok: true, message: 'Application received — our team will be in touch.' });
  }

  const get = (k: string) => (typeof data[k] === 'string' ? data[k].trim() : '');
  const firstName = get('firstName');
  const lastName = get('lastName');
  const address = get('address');
  const contactNumber = get('contactNumber');
  const email = get('email');
  const driverLicense = get('driverLicense');
  const idType = get('idType');
  const rawIdNumber = get('idNumber');
  const idNumber = idType === 'mc' || idType === 'dot' ? normalizeCarrierNumber(rawIdNumber) : rawIdNumber;

  // Server-side validation — never trust the client.
  // Required: name, address, email, driver's license, carrier ID (type + number).
  // Contact number is optional.
  const fields: Record<string, string> = {};
  if (!firstName) fields.firstName = 'First name is required.';
  if (!lastName) fields.lastName = 'Last name is required.';
  if (!address) fields.address = 'Address is required.';
  if (!email) fields.email = 'Email is required.';
  else if (!EMAIL_RE.test(email)) fields.email = 'Enter a valid email address.';
  if (!driverLicense) fields.driverLicense = "Driver's license # is required.";

  if (!idType) fields.idType = 'Select an ID type.';
  else if (!ID_TYPE_LABELS[idType]) fields.idType = 'Select a valid ID type.';

  if (!rawIdNumber) fields.idNumber = 'ID number is required.';
  else if ((idType === 'mc' || idType === 'dot') && !CARRIER_NUM_RE.test(idNumber))
    fields.idNumber = `${ID_TYPE_LABELS[idType]} # must be digits only (up to 8).`;

  if (Object.keys(fields).length) {
    return reply({ ok: false, error: 'Please correct the highlighted fields.', fields }, 400);
  }

  const resend = getResend(locals);
  if (!resend) {
    return reply({ ok: false, error: 'Email service is not configured. Please try again later.' }, 500);
  }

  // Carrier ID shown as "<TYPE> <number>" (e.g. "MC 123456") for at-a-glance triage.
  const rows: Array<[string, string]> = [
    ['Name', `${firstName} ${lastName}`],
    ['Email', email],
    ['Contact Number', contactNumber || '—'],
    ['Address', address],
    ["Driver's License #", driverLicense],
    ['Carrier ID', `${ID_TYPE_LABELS[idType]} ${idNumber}`],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  try {
    const { error } = await resend.emails.send({
      from: site.mail.from,
      to: site.mail.to,
      replyTo: email,
      subject: `New Carrier Application — ${firstName} ${lastName}`,
      text,
      html: renderEmail(`New Carrier Application — ${site.name}`, rows),
    });
    if (error) {
      console.error('Resend error (carrier):', error);
      return reply({ ok: false, error: 'Could not submit your application. Please try again.' }, 502);
    }
  } catch (err) {
    console.error('Resend threw (carrier):', err);
    return reply({ ok: false, error: 'Could not submit your application. Please try again.' }, 502);
  }

  return reply({ ok: true, message: 'Application received — our team will be in touch.' });
};
