import nodemailer from 'nodemailer'

export async function sendEmail(to, code) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Código de recuperación',
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center; color: white; background-color: #222; padding: 30px; border-radius: 10px;">
            <img src="cid:logo" alt="Mi App" style="width: 120px; margin-bottom: 20px;" />
            <h2>Recuperación de contraseña</h2>
            <p>Hola,</p>
            <p>Tu código de recuperación es:</p>
            <h1 style="color: #00BFFF;">${code}</h1>
            <p>Si no solicitaste este código, ignora este correo.</p>
            <hr style="border-color: #555;" />
            <p style="font-size: 12px; color: #aaa;">© 2025 Smartur</p>
        </div>
    `,
        attachments: [
            {
                filename: 'logo.png',
                path: './assets/logo.png',
                cid: 'logo',
            },
        ],
    })
}

export async function sendEmailVerification(to, code) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Tu código de verificación - Smartur',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="cid:logo" alt="Smartur" style="width: 100px;" />
            </div>
            
            <h2 style="color: #333; text-align: center;">Código de Verificación</h2>
            
            <p>Hola,</p>
            
            <p>Estás intentando iniciar sesión en tu cuenta de Smartur. Usa el siguiente código para completar el proceso:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; display: inline-block;">
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00BFFF;">${code}</div>
                </div>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Este código es válido por 15 minutos
            </p>

            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                Si no reconoces esta actividad, por favor ignora este mensaje.<br>
                © 2025 Smartur
            </p>
        </div>
    `,
        attachments: [
            {
                filename: 'logo.png',
                path: './assets/logo.png',
                cid: 'logo',
            },
        ],
    })
}
