import pool from '../config/db.js';

class Template {
    static async findTemplate() {
        const result = await pool.query('SELECT * FROM evaluation_template');
        return result.rows;
    }

    static async findTemplateByid(id_template) {
        const result = await pool.query(
            'select * from evaluation_template WHERE id_template = $1',
            [id_template]
        );
        return result.rows[0];
    }

    static async createTemplate(data) {
        const { name, version, service_type, active } = data;

        const result = await pool.query(
            `INSERT INTO evaluation_template (name, version, service_type, active, creation_date) 
             VALUES ($1 , $2, $3, $4, NOW()) 
             RETURNING *`,
            [name, version, service_type, active]
        );
        return result.rows[0];
    }

    static async deleteTemplate(id_template) {
        const result = await pool.query(
            'DELETE FROM evaluation_template WHERE id_template = $1 RETURNING *',
            [id_template]
        );
        return result.rows[0];
    }
    static async getFullRubric(id_template) {
        // Fetch template
        const template = await this.findTemplateByid(id_template);
        if (!template) return null;

        // Fetch criteria
        const criteriaQuery = `
            SELECT * FROM evaluation_criterion 
            WHERE id_template = $1 AND active = true 
            ORDER BY order_index ASC
        `;
        const criteriaResult = await pool.query(criteriaQuery, [id_template]);
        const criteria = criteriaResult.rows;

        // Fetch subcriteria for each criterion
        const rubric = await Promise.all(
            criteria.map(async (criterion) => {
                const subcriteriaQuery = `
                SELECT * FROM evaluation_subcriterion 
                WHERE id_criterion = $1 
                ORDER BY score ASC
            `;
                const subcriteriaResult = await pool.query(subcriteriaQuery, [
                    criterion.id_criterion,
                ]);
                return {
                    ...criterion,
                    levels: subcriteriaResult.rows,
                };
            })
        );

        return {
            ...template,
            criteria: rubric,
        };
    }
}

export default Template;
