import pool from '../config/db.js';

class Template {
    static async findTemplate(page = 1, limit = 50, search = '', service_type = '', active = null) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        if (search) {
            conditions.push(`name ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        if (service_type) {
            conditions.push(`service_type ILIKE $${index}`);
            values.push(`%${service_type}%`);
            index++;
        }

        if (active !== null) {
            conditions.push(`active = $${index}`);
            values.push(active);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Contar total con filtros
        const countQuery = await pool.query(
            `SELECT COUNT(*) FROM evaluation_template ${whereClause}`,
            values
        );

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // Obtener datos paginados
        const dataQuery = await pool.query(
            `SELECT * FROM evaluation_template
             ${whereClause}
             ORDER BY id_template
             LIMIT $${index}
             OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            templates: dataQuery.rows,
        };
    }

    static async findTemplateByid(id_template) {
        const result = await pool.query(
            'SELECT * FROM evaluation_template WHERE id_template = $1',
            [id_template]
        );
        return result.rows[0] || null;
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
            'UPDATE evaluation_template SET active = FALSE WHERE id_template = $1 AND active = TRUE RETURNING *',
            [id_template]
        );
        return result.rows[0] || null;
    }

    static async updateTemplate(id_template, data) {
        const { name, version, service_type, active } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(name);
        }
        if (version !== undefined) {
            fields.push(`version = $${index++}`);
            values.push(version);
        }
        if (service_type !== undefined) {
            fields.push(`service_type = $${index++}`);
            values.push(service_type);
        }
        if (active !== undefined) {
            fields.push(`active = $${index++}`);
            values.push(active);
        }

        if (fields.length === 0) return null;

        const result = await pool.query(
            `UPDATE evaluation_template 
             SET ${fields.join(', ')} 
             WHERE id_template = $${index} 
             RETURNING *`,
            [...values, id_template]
        );
        return result.rows[0] || null;
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
                    field_type: criterion.field_type || 'scale',
                    is_required: criterion.is_required !== false,
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
