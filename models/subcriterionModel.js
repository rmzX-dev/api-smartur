import pool from '../config/db.js';

class Subcriterion {
    static async findAllByCriterion(id_criterion) {
        const result = await pool.query(
            `SELECT * FROM evaluation_subcriterion 
             WHERE id_criterion = $1 
             ORDER BY order_index ASC, score ASC`,
            [id_criterion]
        );
        return result.rows;
    }

    static async findById(id_subcriterion) {
        const result = await pool.query(
            `SELECT * FROM evaluation_subcriterion WHERE id_subcriterion = $1`,
            [id_subcriterion]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { id_criterion, description, score, order_index } = data;
        const result = await pool.query(
            `INSERT INTO evaluation_subcriterion (id_criterion, description, score, order_index) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [id_criterion, description, score, order_index || 0]
        );
        return result.rows[0];
    }

    static async update(id_subcriterion, data) {
        const fields = [];
        const values = [];
        let index = 1;

        if (data.description !== undefined) {
            fields.push(`description = $${index++}`);
            values.push(data.description);
        }
        if (data.score !== undefined) {
            fields.push(`score = $${index++}`);
            values.push(data.score);
        }
        if (data.order_index !== undefined) {
            fields.push(`order_index = $${index++}`);
            values.push(data.order_index);
        }

        if (fields.length === 0) return null;

        fields.push(`updated_at = NOW()`);

        const result = await pool.query(
            `UPDATE evaluation_subcriterion 
             SET ${fields.join(', ')} 
             WHERE id_subcriterion = $${index} 
             RETURNING *`,
            [...values, id_subcriterion]
        );
        return result.rows[0] || null;
    }

    static async delete(id_subcriterion) {
        const result = await pool.query(
            `DELETE FROM evaluation_subcriterion WHERE id_subcriterion = $1 RETURNING *`,
            [id_subcriterion]
        );
        return result.rows[0] || null;
    }

    static async batchUpdate(id_criterion, subcriteria) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `DELETE FROM evaluation_subcriterion WHERE id_criterion = $1`,
                [id_criterion]
            );

            for (let i = 0; i < subcriteria.length; i++) {
                const sub = subcriteria[i];
                await client.query(
                    `INSERT INTO evaluation_subcriterion (id_criterion, description, score, order_index) 
                     VALUES ($1, $2, $3, $4)`,
                    [id_criterion, sub.description, sub.score, i]
                );
            }

            await client.query('COMMIT');
            return await this.findAllByCriterion(id_criterion);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default Subcriterion;
