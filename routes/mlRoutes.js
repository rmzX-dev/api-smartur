import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import db from '../config/db.js';

const router = express.Router();

const MODELO_URL = process.env.MODELO_URL || 'http://modelo:8000';

/**
 * GET /api/v2/ml/health
 * Returns ML model health for the admin dashboard:
 *   - Latest stored algorithm metrics (RMSE, MAE)
 *   - Daily recommendation sessions over the last 30 days
 *   - Click-through rate on recommendations (30 days)
 */
router.get('/ml/health', verifyToken, async (req, res) => {
    try {
        const [metricsRes, sessionsRes, feedbackRes] = await Promise.all([
            db.query(
                `SELECT metrics_json, created_at
                 FROM ml_model_metrics
                 ORDER BY created_at DESC
                 LIMIT 1`,
            ),
            db.query(
                `SELECT
                   COUNT(*)::int AS total,
                   AVG(execution_time_ms)::numeric(10,2) AS avg_latency_ms,
                   DATE_TRUNC('day', created_at)::date AS day
                 FROM ml_recommendation_session
                 WHERE created_at > NOW() - INTERVAL '30 days'
                 GROUP BY DATE_TRUNC('day', created_at)
                 ORDER BY day DESC`,
            ),
            db.query(
                `SELECT
                   COUNT(*)::int AS total,
                   SUM(CASE WHEN clicked THEN 1 ELSE 0 END)::int AS clicked
                 FROM ml_recommendation_feedback
                 WHERE created_at > NOW() - INTERVAL '30 days'`,
            ),
        ]);

        res.json({
            latest_metrics: metricsRes.rows[0]?.metrics_json ?? null,
            daily_sessions: sessionsRes.rows,
            ctr_30d: feedbackRes.rows[0] ?? { total: 0, clicked: 0 },
        });
    } catch (err) {
        console.error('[ml/health] error:', err.message);
        res.status(500).json({ message: 'Error al obtener estado del modelo ML.' });
    }
});

/**
 * POST /api/v2/ml/recommend/:userId
 * Proxies a recommendation request to the MODELO service,
 * persists the session to ml_recommendation_session, and returns the result.
 * Body: { alpha?, top_n?, context? }
 */
router.post('/ml/recommend/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    const { alpha = 0.2, top_n = 5, context = null } = req.body ?? {};
    const start = Date.now();

    try {
        const modeloRes = await fetch(`${MODELO_URL}/recommend/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alpha: +alpha, top_n: +top_n, context }),
            signal: AbortSignal.timeout(15_000),
        });

        if (!modeloRes.ok) {
            const detail = await modeloRes.text().catch(() => '');
            return res.status(502).json({ message: 'Modelo no disponible.', detail });
        }

        const data = await modeloRes.json();
        const latencyMs = Date.now() - start;

        const { rows } = await db.query(
            `INSERT INTO ml_recommendation_session
               (user_id, alpha, best_algorithm, execution_time_ms, context_json)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
                userId,
                alpha,
                data.best_algorithm ?? 'hybrid',
                latencyMs,
                JSON.stringify(data),
            ],
        );

        res.json({ ...data, session_id: rows[0].id, latency_ms: latencyMs });
    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return res.status(504).json({ message: 'El servicio de recomendaciones tardó demasiado.' });
        }
        console.error('[ml/recommend] proxy error:', err.message);
        res.status(502).json({ message: 'Servicio ML no disponible.', detail: err.message });
    }
});

/**
 * POST /api/v2/ml/feedback
 * Records whether a recommended item was clicked.
 * Body: { session_id, item_id, rank_pos, clicked }
 */
router.post('/ml/feedback', verifyToken, async (req, res) => {
    const { session_id, item_id, rank_pos, clicked = false } = req.body ?? {};
    if (!session_id || !item_id || rank_pos == null) {
        return res.status(400).json({ message: 'session_id, item_id y rank_pos son requeridos.' });
    }
    try {
        await db.query(
            `INSERT INTO ml_recommendation_feedback (session_id, item_id, rank_pos, clicked, clicked_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [session_id, item_id, parseInt(rank_pos, 10), Boolean(clicked), clicked ? new Date() : null],
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('[ml/feedback] error:', err.message);
        res.status(500).json({ message: 'Error al registrar feedback.' });
    }
});

export default router;
