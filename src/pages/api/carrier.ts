import type { APIRoute } from 'astro';
import { site } from '../../../site.config.js';
import { getResend, json, EMAIL_RE, renderEmail, isHoneypotTripped } from '../../lib/mail';

// Run server-side as a Cloudflare Pages Function (hybrid output).
export const prerender = false;

const MC_RE = /^\d{6}$/; // exactly 6 digits
const DOT_RE = /^\d{9}$/; // exactly 9 digits

// Carrier ID type → display label. The applicant picks one and supplies a
// single ID number; the format check below adapts to the chosen type.
const ID_TYPE_LABELS: Record<string, string> = { mc: 'MC', dot: 'DOT', other: 'Other' };

export const POST: APIRoute = async ({ request, locals }) => {
  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot: silently accept (no email) so bots think it worked and don't retry.
  if (isHoneypotTripped(data)) {
    return json({ ok: true, message: 'Application received — our team will be in touch.' });
  }

  const get = (k: string) => (typeof data[k] === 'string' ? data[k].trim() : '');
  const firstName = get('firstName');
  const lastName = get('lastName');
  const address = get('address');
  const contactNumber = get('contactNumber');
  const email = get('email');
  const driverLicense = get('driverLicense');
  const idType = get('idType');
  const idNumber = get('idNumber');

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

  if (!idNumber) fields.idNumber = 'ID number is required.';
  else if (idType === 'mc' && !MC_RE.test(idNumber)) fields.idNumber = 'MC # must be exactly 6 digits.';
  else if (idType === 'dot' && !DOT_RE.test(idNumber)) fields.idNumber = 'DOT # must be exactly 9 digits.';

  if (Object.keys(fields).length) {
    return json({ ok: false, error: 'Please correct the highlighted fields.', fields }, 400);
  }

  const resend = getResend(locals);
  if (!resend) {
    return json({ ok: false, error: 'Email service is not configured. Please try again later.' }, 500);
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
      return json({ ok: false, error: 'Could not submit your application. Please try again.' }, 502);
    }
  } catch (err) {
    console.error('Resend threw (carrier):', err);
    return json({ ok: false, error: 'Could not submit your application. Please try again.' }, 502);
  }

  return json({ ok: true, message: 'Application received — our team will be in touch.' });
};
