import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import db from '../config/db.js';

const router = express.Router();

/**
 * POST /api/v2/me/interactions
 * Batch-ingests implicit behavioral events from the mobile app.
 * Accepts up to 50 events per request.
 * events[]: { place_kind?, place_id?, event_type, dwell_ms?, meta? }
 */
router.post('/me/interactions', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ message: 'events[] es requerido y no puede estar vacío.' });
    }
    if (events.length > 50) {
        return res.status(400).json({ message: 'Máximo 50 eventos por petición.' });
    }

    const valid = events.filter(
        (e) => e && typeof e.event_type === 'string' && e.event_type.length > 0,
    );
    if (valid.length === 0) {
        return res.status(400).json({ message: 'Ningún evento válido en el batch.' });
    }

    try {
        const userIds = valid.map(() => userId);
        const placeKinds = valid.map((e) => e.place_kind ?? null);
        const placeIds = valid.map((e) => (e.place_id != null ? parseInt(e.place_id, 10) : null));
        const eventTypes = valid.map((e) => e.event_type);
        const dwellMs = valid.map((e) => (e.dwell_ms != null ? parseInt(e.dwell_ms, 10) : null));
        const metas = valid.map((e) => (e.meta != null ? JSON.stringify(e.meta) : null));

        await db.query(
            `INSERT INTO user_interaction (user_id, place_kind, place_id, event_type, dwell_ms, meta)
             SELECT * FROM UNNEST(
               $1::int[], $2::varchar[], $3::int[], $4::varchar[], $5::int[], $6::jsonb[]
             )`,
            [userIds, placeKinds, placeIds, eventTypes, dwellMs, metas],
        );

        res.json({ ok: true, saved: valid.length });
    } catch (err) {
        console.error('[interactions] batch insert error:', err.message);
        res.status(500).json({ message: 'Error al guardar interacciones.' });
    }
});

/**
 * POST /api/v2/me/rating
 * Upserts an explicit 1–5 star rating for a place.
 * Body: { place_kind: 'svc'|'poi', place_id: number, rating: 1-5 }
 */
router.post('/me/rating', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { place_kind, place_id, rating } = req.body;

    if (!['svc', 'poi'].includes(place_kind)) {
        return res.status(400).json({ message: 'place_kind debe ser svc o poi.' });
    }
    const pid = parseInt(place_id, 10);
    const stars = parseInt(rating, 10);
    if (Number.isNaN(pid) || pid <= 0) {
        return res.status(400).json({ message: 'place_id inválido.' });
    }
    if (Number.isNaN(stars) || stars < 1 || stars > 5) {
        return res.status(400).json({ message: 'rating debe estar entre 1 y 5.' });
    }

    try {
        await db.query(
            `INSERT INTO user_rating (user_id, place_kind, place_id, rating, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id, place_kind, place_id)
             DO UPDATE SET rating = $4, updated_at = NOW()`,
            [userId, place_kind, pid, stars],
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('[rating] upsert error:', err.message);
        res.status(500).json({ message: 'Error al guardar la calificación.' });
    }
});

/**
 * GET /api/v2/me/rating/:kind/:placeId
 * Returns the authenticated user's rating for a specific place (or null).
 */
router.get('/me/rating/:kind/:placeId', verifyToken, async (req, res) => {
    const kind = req.params.kind;
    const pid = parseInt(req.params.placeId, 10);
    if (!['svc', 'poi'].includes(kind) || Number.isNaN(pid)) {
        return res.status(400).json({ message: 'Parámetros inválidos.' });
    }
    try {
        const { rows } = await db.query(
            `SELECT rating FROM user_rating WHERE user_id = $1 AND place_kind = $2 AND place_id = $3`,
            [req.user.id, kind, pid],
        );
        res.json({ rating: rows[0]?.rating ?? null });
    } catch (err) {
        console.error('[rating] get error:', err.message);
        res.status(500).json({ message: 'Error al consultar calificación.' });
    }
});

export default router;
