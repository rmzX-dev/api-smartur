import express from 'express';
import { sendWelcomeEmail } from '../utils/mailer.js';

const router = express.Router();

router.post('/contact', async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ message: 'Email inválido.' });
    }

    try {
        await sendWelcomeEmail(email.trim().toLowerCase());
        res.json({ ok: true });
    } catch (err) {
        console.error('[contact] Error enviando email:', err.message);
        res.status(500).json({ message: 'No se pudo enviar el correo. Intenta de nuevo.' });
    }
});

export default router;
