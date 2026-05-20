import express from 'express';
import { sendWelcomeEmail } from '../utils/mailer.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import db from '../config/db.js';

const router = express.Router();

router.post('/contact', async (req, res) => {
    const { email, source = 'landing_b2b' } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ message: 'Email inválido.' });
    }

    const clean = email.trim().toLowerCase();
    try {
        await db.query(
            'INSERT INTO contact_subscription (email, source) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [clean, source],
        );
        await sendWelcomeEmail(clean);
        res.json({ ok: true });
    } catch (err) {
        console.error('[contact] Error:', err.message);
        res.status(500).json({ message: 'No se pudo procesar la solicitud. Intenta de nuevo.' });
    }
});

router.get('/contact-subscriptions', verifyToken, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const offset = (page - 1) * limit;

    try {
        const { rows: countRows } = await db.query('SELECT COUNT(*)::int AS total FROM contact_subscription');
        const total = countRows[0].total;
        const { rows } = await db.query(
            'SELECT id, email, source, created_at FROM contact_subscription ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset],
        );
        res.json({
            subscriptions: rows,
            totalRecords: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit,
        });
    } catch (err) {
        console.error('[contact] GET subscriptions error:', err.message);
        res.status(500).json({ message: 'Error al obtener suscripciones.' });
    }
});

router.delete('/contact-subscriptions/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido.' });

    try {
        const { rowCount } = await db.query('DELETE FROM contact_subscription WHERE id = $1', [id]);
        if (!rowCount) return res.status(404).json({ message: 'Suscripción no encontrada.' });
        res.json({ ok: true });
    } catch (err) {
        console.error('[contact] DELETE subscription error:', err.message);
        res.status(500).json({ message: 'Error al eliminar suscripción.' });
    }
});

export default router;
