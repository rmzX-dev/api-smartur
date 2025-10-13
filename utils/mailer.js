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
