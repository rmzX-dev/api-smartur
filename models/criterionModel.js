import pool from '../config/db.js';

class Criterion {
    static async findAllCriterion(
        page = 1,
        limit = 50,
        search = '',
        id_template = null,
        active = null
    ) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        if (search) {
            conditions.push(`(name ILIKE $${index} OR description ILIKE $${index})`);
            values.push(`%${search}%`);
            index++;
        }

        if (id_template !== null) {
            conditions.push(`id_template = $${index}`);
            values.push(id_template);
            index++;
        }

        if (active !== null) {
            conditions.push(`active = $${index}`);
            values.push(active);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM evaluation_criterion ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        const dataQuery = await pool.query(
            `SELECT * FROM evaluation_criterion
             ${whereClause}
             ORDER BY order_index ASC
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            criteria: dataQuery.rows,
        };
    }

    static async findCriterionById(id_criterion) {
        const result = await pool.query(
            `SELECT * FROM evaluation_criterion WHERE id_criterion = $1`,
            [id_criterion]
        );
        return result.rows[0] || null;
    }

    static async createCriterion(data) {
        const { id_template, name, description, weight, order_index, active, field_type, is_required } = data;
        const result = await pool.query(
            `INSERT INTO evaluation_criterion (id_template, name, description, weight, order_index, active, field_type, is_required) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING id_criterion, id_template, name, description, weight, order_index, active, field_type, is_required`,
            [id_template, name, description, weight, order_index, active, field_type || 'scale', is_required !== false]
        );
        return result.rows[0];
    }

    static async deleteCriterion(id_criterion) {
        const result = await pool.query(
            `UPDATE evaluation_criterion SET active = FALSE WHERE id_criterion = $1 AND active = TRUE RETURNING *`,
            [id_criterion]
        );
        return result.rows[0] || null;
    }

    static async updateCriterion(id_criterion, data) {
        const { name, description, weight, order_index, active, field_type, is_required } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(name);
        }
        if (description !== undefined) {
            fields.push(`description = $${index++}`);
            values.push(description);
        }
        if (weight !== undefined) {
            fields.push(`weight = $${index++}`);
            values.push(weight);
        }
        if (order_index !== undefined) {
            fields.push(`order_index = $${index++}`);
            values.push(order_index);
        }
        if (active !== undefined) {
            fields.push(`active = $${index++}`);
            values.push(active);
        }
        if (field_type !== undefined) {
            fields.push(`field_type = $${index++}`);
            values.push(field_type);
        }
        if (is_required !== undefined) {
            fields.push(`is_required = $${index++}`);
            values.push(is_required);
        }

        if (fields.length === 0) return null;

        const result = await pool.query(
            `UPDATE evaluation_criterion 
             SET ${fields.join(', ')} 
             WHERE id_criterion = $${index} 
             RETURNING id_criterion, id_template, name, description, weight, order_index, active, field_type, is_required`,
            [...values, id_criterion]
        );
        return result.rows[0] || null;
    }
}

export default Criterion;
