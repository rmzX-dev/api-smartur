import nodemailer from 'nodemailer'

export async function sendEmail(to, code) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Código de recuperación',
        text: `Tu código de recuperación es: ${code}`
    })
}
