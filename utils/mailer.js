import nodemailer from 'nodemailer';

const PRIMARY = '#FC478E';
const PRIMARY_LIGHT = '#FFF5F9';
const TEXT = '#1a1a1a';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';

function createTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

const FROM_NAME = `"SMARTUR" <${process.env.EMAIL_USER || 'noreply@smartur.mx'}>`;

function logoAttachment() {
    return [
        {
            filename: 'logo.png',
            path: './assets/logo.png',
            cid: 'smartur-logo',
        },
    ];
}

const heading = (text) =>
    `<h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:${TEXT};line-height:1.3;">${text}</h1>`;

const paragraph = (text) =>
    `<p style="margin:0 0 16px;color:${MUTED};font-size:15px;line-height:1.6;">${text}</p>`;

const codeBlock = (code) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center" style="background:${PRIMARY_LIGHT};border:1px solid ${BORDER};border-radius:8px;padding:20px 24px;">
        <span style="font-size:28px;font-weight:600;letter-spacing:6px;color:${PRIMARY};font-family:Consolas,Monaco,monospace;">
          ${code}
        </span>
      </td>
    </tr>
  </table>`;

const ctaButton = (url, label) => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
    <tr>
      <td align="center" style="border-radius:6px;background:${PRIMARY};">
        <a href="${url}" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;

const BASE_HTML = (content, title) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" border="0"
               style="background:#ffffff;border-radius:8px;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:3px solid ${PRIMARY};">
              <img src="cid:smartur-logo" alt="SMARTUR" width="88" style="display:inline-block;"/>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:${TEXT};">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;text-align:center;color:#9ca3af;font-size:12px;line-height:1.5;border-top:1px solid ${BORDER};">
              SMARTUR · Las Altas Montañas, Veracruz<br/>
              Si no solicitaste este correo, puedes ignorarlo.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

async function deliver({ to, subject, text, html, title, bulk = true }) {
    const transporter = createTransporter();
    const headers = { 'X-Mailer': 'SMARTUR Mailer' };
    if (bulk) {
        headers['X-Priority'] = '3';
        headers.Precedence = 'bulk';
    }

    await transporter.sendMail({
        from: FROM_NAME,
        to,
        subject,
        text,
        html: BASE_HTML(html, title),
        attachments: logoAttachment(),
        headers,
    });
}

export async function sendEmail(to, code) {
    const content = `
      ${heading('Recuperación de contraseña')}
      ${paragraph('Usa este código para restablecer tu contraseña.')}
      ${codeBlock(code)}
      ${paragraph(`Válido por <strong style="color:${TEXT};">15 minutos</strong>. Si no lo solicitaste, ignora este correo.`)}`;

    await deliver({
        to,
        subject: 'Código de recuperación — SMARTUR',
        title: 'Recuperación de contraseña',
        text: `Recuperación de contraseña\n\nCódigo: ${code}\n\nVálido 15 minutos.\n\nSMARTUR`,
        html: content,
    });
}

export async function sendEmailVerification(to, code) {
    const content = `
      ${heading('Verificación de acceso')}
      ${paragraph('Introduce este código para completar el inicio de sesión.')}
      ${codeBlock(code)}
      ${paragraph(`Válido por <strong style="color:${TEXT};">15 minutos</strong>. Si no reconoces esta actividad, ignora este correo.`)}`;

    await deliver({
        to,
        subject: 'Código de verificación — SMARTUR',
        title: 'Verificación de acceso',
        text: `Verificación de acceso\n\nCódigo: ${code}\n\nVálido 15 minutos.\n\nSMARTUR`,
        html: content,
    });
}

export async function sendContactNotification(toAdmin, { email, reason, message, source }) {
    const reasonText = reason || 'No especificado';
    const messageText = message || '(sin mensaje)';
    const sourceText = source || 'desconocida';

    const content = `
      ${heading('Nuevo mensaje de contacto')}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:${MUTED};width:90px;vertical-align:top;">Correo</td>
          <td style="padding:8px 0;color:${TEXT};">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${MUTED};vertical-align:top;">Motivo</td>
          <td style="padding:8px 0;color:${TEXT};">${reasonText}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${MUTED};vertical-align:top;">Fuente</td>
          <td style="padding:8px 0;color:${TEXT};">${sourceText}</td>
        </tr>
      </table>
      <div style="background:#f9fafb;padding:16px;border-radius:6px;border-left:3px solid ${PRIMARY};">
        <p style="margin:0;color:${TEXT};white-space:pre-wrap;font-size:14px;line-height:1.6;">${messageText}</p>
      </div>`;

    await deliver({
        to: toAdmin,
        subject: `[SMARTUR] Contacto: ${reasonText}`,
        title: 'Nuevo contacto',
        text: `Contacto\n\nCorreo: ${email}\nMotivo: ${reasonText}\nFuente: ${sourceText}\n\n${messageText}`,
        html: content,
        bulk: false,
    });
}

export async function sendWelcomeEmail(to) {
    const platformUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() ?? 'https://smartur.mx';

    const content = `
      ${heading('Bienvenido a SMARTUR')}
      ${paragraph('Gracias por registrarte. Explora rutas, gastronomía y cultura de Las Altas Montañas desde un solo lugar.')}
      ${ctaButton(platformUrl, 'Ir a la plataforma')}`;

    await deliver({
        to,
        subject: 'Bienvenido a SMARTUR',
        title: 'Bienvenido a SMARTUR',
        text: `Bienvenido a SMARTUR\n\nVisita ${platformUrl} para comenzar.\n\nSMARTUR`,
        html: content,
    });
}
