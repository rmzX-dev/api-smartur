import pool from '../config/db.js';

const YELP_WHITELIST = new Set([
    'Active Life',
    'Arts & Entertainment',
    'Bars',
    'Bed & Breakfast',
    'Botanical Gardens',
    'Cafes',
    'Campgrounds',
    'Cultural Centers',
    'Food',
    'Guest Houses',
    'Hiking',
    'Historical Tours',
    'Hotels',
    'Hotels & Travel',
    'Lakes',
    'Landmarks & Historical Buildings',
    'Museums',
    'Nightlife',
    'Parks',
    'Rafting',
    'Restaurants',
    'Tours',
    'Traditional Mexican',
    'Vacation Rentals',
]);

const CATEGORY_MAP = {
    hotel: ['Hotels & Travel', 'Hotels'],
    hostel: ['Hotels & Travel', 'Hostels'],
    posada: ['Hotels & Travel', 'Guest Houses'],
    bnb: ['Hotels & Travel', 'Bed & Breakfast'],
    hospedaje: ['Hotels & Travel', 'Hotels'],
    alojamiento: ['Hotels & Travel', 'Hotels'],
    motel: ['Hotels & Travel', 'Hotels'],
    hoteleria: ['Hotels & Travel', 'Hotels'],
    airbnb: ['Hotels & Travel', 'Vacation Rentals'],
    renta: ['Hotels & Travel', 'Vacation Rentals'],

    restaurante: ['Restaurants', 'Food'],
    restaurant: ['Restaurants', 'Food'],
    food: ['Food'],
    comida: ['Food'],
    cafe: ['Cafes', 'Food'],
    cafeterias: ['Cafes', 'Food'],
    bar: ['Bars', 'Nightlife'],
    cantina: ['Bars', 'Nightlife'],

    museo: ['Museums', 'Arts & Entertainment'],
    museos: ['Museums', 'Arts & Entertainment'],
    cultural: ['Arts & Entertainment', 'Cultural Centers'],
    cultura: ['Arts & Entertainment'],
    historia: ['Landmarks & Historical Buildings'],
    historico: ['Landmarks & Historical Buildings'],

    tour: ['Tours', 'Active Life'],
    tours: ['Tours', 'Active Life'],
    excursion: ['Tours', 'Active Life'],
    excursiones: ['Tours', 'Active Life'],
    aventura: ['Active Life'],
    hiking: ['Hiking', 'Active Life'],
    senderismo: ['Hiking', 'Active Life'],
    rafting: ['Rafting', 'Active Life'],
    parque: ['Parks', 'Active Life'],
    parques: ['Parks', 'Active Life'],
    jardin: ['Botanical Gardens', 'Parks'],
    jardines: ['Botanical Gardens', 'Parks'],
    lago: ['Lakes', 'Parks'],
    laguna: ['Lakes', 'Parks'],
    naturaleza: ['Parks', 'Active Life'],
};

const normalizeCategory = (value) =>
    String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const splitCategories = (raw) =>
    String(raw || '')
        .split(/[,/|]/)
        .map((c) => normalizeCategory(c))
        .filter(Boolean);

const mapCategories = (raw) => {
    const parts = splitCategories(raw);
    const mapped = new Set();
    for (const part of parts) {
        const targets = CATEGORY_MAP[part];
        if (targets) {
            for (const t of targets) {
                if (YELP_WHITELIST.has(t)) {
                    mapped.add(t);
                }
            }
        }
    }
    return Array.from(mapped);
};

const parseNumber = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const parsePriceLevel = (value) => {
    const parsed = parseNumber(value, 2);
    if (parsed === null) return 2;
    return clamp(Math.round(parsed), 1, 4);
};

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const v = String(value).toLowerCase().trim();
    return v === 'true' || v === '1' || v === 'yes';
};

class PointOfInterestController {
    static async findAllController(req, res) {
        try {
            const page = parseNumber(req.query.page, 1) || 1;
            const limit = Math.min(parseNumber(req.query.limit, 50) || 50, 100);
            const search = String(req.query.search || '').trim();

            const offset = (page - 1) * limit;
            const values = [];
            const conditions = [];

            if (search) {
                values.push(`%${search}%`);
                conditions.push(`(name ILIKE $${values.length} OR categories_raw ILIKE $${values.length})`);
            }

            const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

            const countResult = await pool.query(
                `SELECT COUNT(*)::int AS c FROM point_of_interest ${whereClause}`,
                values
            );

            values.push(limit, offset);
            const dataResult = await pool.query(
                `SELECT * FROM point_of_interest
                 ${whereClause}
                 ORDER BY id DESC
                 LIMIT $${values.length - 1}
                 OFFSET $${values.length}`,
                values
            );

            return res.json({
                message: 'Points of interest fetched successfully',
                totalRecords: countResult.rows[0]?.c || 0,
                totalPages: Math.ceil((countResult.rows[0]?.c || 0) / limit),
                currentPage: page,
                points: dataResult.rows,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    static async findByIdController(req, res) {
        try {
            const id = parseNumber(req.params.id_point, null);
            if (!id) {
                return res.status(400).json({ message: 'Invalid id' });
            }

            const result = await pool.query(
                'SELECT * FROM point_of_interest WHERE id = $1',
                [id]
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Point of interest not found' });
            }

            return res.json({
                message: 'Point of interest fetched successfully',
                point: result.rows[0],
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    static async createController(req, res) {
        try {
            const name = String(req.body?.name || '').trim();
            const categoriesRaw = String(req.body?.categories_raw || '').trim();

            if (!name || !categoriesRaw) {
                return res.status(400).json({
                    message: 'name and categories_raw are required',
                });
            }

            const categoriesMapped = mapCategories(categoriesRaw);
            const priceLevel = parsePriceLevel(req.body?.price_level);
            const isAccessible = parseBoolean(req.body?.is_accessible, false);
            const outdoor = parseBoolean(req.body?.outdoor, false);
            const latitude = parseNumber(req.body?.latitude, null);
            const longitude = parseNumber(req.body?.longitude, null);

            const result = await pool.query(
                `INSERT INTO point_of_interest
                (name, categories_raw, categories_mapped, price_level, is_accessible, outdoor, latitude, longitude)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [
                    name,
                    categoriesRaw,
                    JSON.stringify(categoriesMapped),
                    priceLevel,
                    isAccessible,
                    outdoor,
                    latitude,
                    longitude,
                ]
            );

            return res.status(201).json({
                message: 'Point of interest created successfully',
                point: result.rows[0],
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    static async updateController(req, res) {
        try {
            const id = parseNumber(req.params.id_point, null);
            if (!id) {
                return res.status(400).json({ message: 'Invalid id' });
            }

            const updates = [];
            const values = [];
            let idx = 1;

            if (req.body?.name !== undefined) {
                updates.push(`name = $${idx++}`);
                values.push(String(req.body.name).trim());
            }

            if (req.body?.categories_raw !== undefined) {
                const raw = String(req.body.categories_raw || '').trim();
                updates.push(`categories_raw = $${idx++}`);
                values.push(raw);

                const mapped = mapCategories(raw);
                updates.push(`categories_mapped = $${idx++}`);
                values.push(JSON.stringify(mapped));
            }

            if (req.body?.price_level !== undefined) {
                updates.push(`price_level = $${idx++}`);
                values.push(parsePriceLevel(req.body.price_level));
            }

            if (req.body?.is_accessible !== undefined) {
                updates.push(`is_accessible = $${idx++}`);
                values.push(parseBoolean(req.body.is_accessible, false));
            }

            if (req.body?.outdoor !== undefined) {
                updates.push(`outdoor = $${idx++}`);
                values.push(parseBoolean(req.body.outdoor, false));
            }

            if (req.body?.latitude !== undefined) {
                updates.push(`latitude = $${idx++}`);
                values.push(parseNumber(req.body.latitude, null));
            }

            if (req.body?.longitude !== undefined) {
                updates.push(`longitude = $${idx++}`);
                values.push(parseNumber(req.body.longitude, null));
            }

            if (!updates.length) {
                return res.status(400).json({ message: 'No fields to update' });
            }

            values.push(id);
            const result = await pool.query(
                `UPDATE point_of_interest
                 SET ${updates.join(', ')}
                 WHERE id = $${idx}
                 RETURNING *`,
                values
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Point of interest not found' });
            }

            return res.json({
                message: 'Point of interest updated successfully',
                point: result.rows[0],
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
    }

    static async deleteController(req, res) {
        try {
            const id = parseNumber(req.params.id_point, null);
            if (!id) {
                return res.status(400).json({ message: 'Invalid id' });
            }

            const result = await pool.query(
                'DELETE FROM point_of_interest WHERE id = $1 RETURNING *',
                [id]
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'Point of interest not found' });
            }

            return res.json({
                message: 'Point of interest deleted successfully',
                point: result.rows[0],
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
    }
}

export default PointOfInterestController;
