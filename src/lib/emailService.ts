/**
 * Email service using EmailJS (https://www.emailjs.com)
 * Free tier: 200 emails/month — no backend needed.
 *
 * SETUP (one-time):
 * 1. Go to https://www.emailjs.com and create a free account
 * 2. Add an Email Service (Gmail, Outlook, etc.)
 * 3. Create two Email Templates:
 *    - Template "welcome": subject "Welcome to Sweetest Studio!", body uses {{to_name}}, {{to_email}}
 *    - Template "reset":   subject "Reset your password", body uses {{to_name}}, {{reset_code}}, {{to_email}}
 * 4. Replace the three constants below with your real IDs from the EmailJS dashboard
 */

// ─── CONFIGURE THESE ──────────────────────────────────────────────────────────
const EMAILJS_PUBLIC_KEY  = "YOUR_EMAILJS_PUBLIC_KEY";   // Account → API Keys
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";           // Email Services → Service ID
const EMAILJS_WELCOME_TPL = "template_welcome";          // Email Templates → Template ID
const EMAILJS_RESET_TPL   = "template_reset";            // Email Templates → Template ID
// ──────────────────────────────────────────────────────────────────────────────

const CONFIGURED =
  EMAILJS_PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY" &&
  EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID";

async function sendEmail(templateId: string, params: Record<string, string>) {
  if (!CONFIGURED) {
    console.info("[EmailJS] Not configured — email would send:", params);
    return { ok: true, simulated: true };
  }
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: params,
      }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/** Send a welcome email when a new user signs up */
export async function sendWelcomeEmail(name: string, email: string) {
  return sendEmail(EMAILJS_WELCOME_TPL, {
    to_name: name,
    to_email: email,
    from_name: "Sweetest Studio",
    reply_to: "noreply@sweeteststudio.ai",
  });
}

/** Generate a 6-digit reset code and send it to the user's email */
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendPasswordResetEmail(name: string, email: string, code: string) {
  return sendEmail(EMAILJS_RESET_TPL, {
    to_name: name,
    to_email: email,
    reset_code: code,
    from_name: "Sweetest Studio",
    reply_to: "noreply@sweeteststudio.ai",
  });
}
