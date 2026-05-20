import nodemailer from 'nodemailer';

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

const BASE_HTML = (content, title) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#6d28d9;padding:24px 32px;text-align:center;">
              <img src="cid:smartur-logo" alt="SMARTUR" width="100" style="display:inline-block;"/>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:16px 32px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee;">
              © 2025 SMARTUR · Las Altas Montañas, Veracruz, México<br/>
              Si no solicitaste este correo, puedes ignorarlo con seguridad.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export async function sendEmail(to, code) {
    const transporter = createTransporter();

    const content = `
      <h2 style="color:#6d28d9;margin-top:0;">Recuperación de contraseña</h2>
      <p>Hola,</p>
      <p>Tu código de recuperación es:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;background:#f3f0ff;color:#6d28d9;font-size:36px;font-weight:bold;
                     letter-spacing:8px;padding:16px 32px;border-radius:8px;border:2px dashed #c4b5fd;">
          ${code}
        </span>
      </div>
      <p style="color:#555;">Este código expira en <strong>15 minutos</strong>.</p>
      <p style="color:#555;">Si no solicitaste este código, ignora este correo. Tu cuenta está segura.</p>`;

    const text = `Recuperación de contraseña\n\nTu código de recuperación es: ${code}\n\nEste código expira en 15 minutos.\n\nSi no solicitaste este código, ignora este correo.\n\n© 2025 SMARTUR`;

    await transporter.sendMail({
        from: FROM_NAME,
        to,
        subject: 'Código de recuperación — SMARTUR',
        text,
        html: BASE_HTML(content, 'Código de recuperación'),
        attachments: logoAttachment(),
        headers: {
            'X-Mailer': 'SMARTUR Mailer v2',
            'X-Priority': '3',
            Precedence: 'bulk',
        },
    });
}

export async function sendEmailVerification(to, code) {
    const transporter = createTransporter();

    const content = `
      <h2 style="color:#6d28d9;margin-top:0;">Verificación de inicio de sesión</h2>
      <p>Hola,</p>
      <p>Estás iniciando sesión en tu cuenta de SMARTUR. Usa el siguiente código para completar el proceso:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;background:#f3f0ff;color:#6d28d9;font-size:36px;font-weight:bold;
                     letter-spacing:8px;padding:16px 32px;border-radius:8px;border:2px dashed #c4b5fd;">
          ${code}
        </span>
      </div>
      <p style="color:#555;">Este código es válido por <strong>15 minutos</strong>.</p>
      <p style="color:#555;">Si no reconoces esta actividad, ignora este mensaje y tu cuenta permanecerá segura.</p>`;

    const text = `Verificación de inicio de sesión — SMARTUR\n\nCódigo: ${code}\n\nVálido por 15 minutos.\n\nSi no reconoces esta actividad, ignora este mensaje.\n\n© 2025 SMARTUR`;

    await transporter.sendMail({
        from: FROM_NAME,
        to,
        subject: 'Tu código de verificación — SMARTUR',
        text,
        html: BASE_HTML(content, 'Código de verificación'),
        attachments: logoAttachment(),
        headers: {
            'X-Mailer': 'SMARTUR Mailer v2',
            'X-Priority': '3',
            Precedence: 'bulk',
        },
    });
}

export async function sendWelcomeEmail(to) {
    const transporter = createTransporter();

    const platformUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() ?? 'https://smartur.mx';

    const content = `
      <h2 style="color:#6d28d9;margin-top:0;">¡Bienvenido/a a SMARTUR! 🗺️</h2>
      <p>Hola, viajero/a,</p>
      <p>Gracias por tu interés en <strong>SMARTUR</strong>. Estamos aquí para ayudarte a descubrir los rincones más fascinantes de Las Altas Montañas, Veracruz.</p>
      <p>Con nuestra plataforma puedes:</p>
      <ul style="color:#444;line-height:2;">
        <li>🏔️ Obtener rutas personalizadas con inteligencia artificial</li>
        <li>🍽️ Descubrir gastronomía y cultura local auténtica</li>
        <li>🌿 Explorar naturaleza, historia y tradición en un solo lugar</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="${platformUrl}"
           style="display:inline-block;background:#ec4899;color:#ffffff;text-decoration:none;
                  padding:14px 32px;border-radius:50px;font-weight:bold;font-size:15px;">
          Empezar mi aventura →
        </a>
      </div>
      <p style="color:#555;font-size:13px;">Si recibiste este correo por error, simplemente ignóralo.</p>`;

    const text = `¡Bienvenido/a a SMARTUR!\n\nGracias por tu interés. Visita ${platformUrl} para empezar tu aventura.\n\n© 2025 SMARTUR`;

    await transporter.sendMail({
        from: FROM_NAME,
        to,
        subject: '¡Tu aventura en Las Altas Montañas comienza aquí! — SMARTUR',
        text,
        html: BASE_HTML(content, 'Bienvenido a SMARTUR'),
        attachments: logoAttachment(),
        headers: {
            'X-Mailer': 'SMARTUR Mailer v2',
            'X-Priority': '3',
            Precedence: 'bulk',
        },
    });
}
