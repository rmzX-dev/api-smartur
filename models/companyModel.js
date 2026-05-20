import pool from '../config/db.js';

class Company {
    static async findAll(page = 1, limit = 50, search = '', location = null, sector = null) {
        const offset = (page - 1) * limit;

        const values = [];
        const conditions = [];
        let index = 1;

        conditions.push(`is_active = TRUE`);

        if (search) {
            conditions.push(`name ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        if (location) {
            conditions.push(`id_location = $${index}`);
            values.push(location);
            index++;
        }

        if (sector) {
            conditions.push(`id_sector = $${index}`);
            values.push(sector);
            index++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // 1️⃣ Contar total con filtros
        const countQuery = await pool.query(`SELECT COUNT(*) FROM company ${whereClause}`, values);

        const totalRecords = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(totalRecords / limit);

        // 2️⃣ Obtener datos paginados
        const dataQuery = await pool.query(
            `
        SELECT *
        FROM company
        ${whereClause}
        ORDER BY id_company
        LIMIT $${index}
        OFFSET $${index + 1}
        `,
            [...values, limit, offset]
        );

        return {
            totalRecords,
            totalPages,
            currentPage: page,
            companies: dataQuery.rows,
        };
    }

    static async findById(id_company) {
        const result = await pool.query(
            `SELECT * FROM company 
         WHERE id_company = $1 AND is_active = TRUE`,
            [id_company]
        );
        return result.rows[0] || null;
    }

    static async create(data) {
        const { name, address, phone, id_sector, id_location } = data;

        const result = await pool.query(
            `INSERT INTO company (name, address, phone, id_sector, id_location) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [name, address, phone, id_sector, id_location]
        );

        return result.rows[0];
    }

    static async update(id_company, data) {
        const { name, address, phone, id_sector, id_location } = data;

        const fields = [];
        const values = [];
        let index = 1;

        if (name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(name);
        }

        if (address !== undefined) {
            fields.push(`address = $${index++}`);
            values.push(address);
        }

        if (phone !== undefined) {
            fields.push(`phone = $${index++}`);
            values.push(phone);
        }

        if (id_sector !== undefined) {
            fields.push(`id_sector = $${index++}`);
            values.push(id_sector);
        }

        if (id_location !== undefined) {
            fields.push(`id_location = $${index++}`);
            values.push(id_location);
        }

        if (fields.length === 0) {
            return null;
        }

        const result = await pool.query(
            `UPDATE company
         SET ${fields.join(', ')}
         WHERE id_company = $${index} AND is_active = TRUE
         RETURNING *`,
            [...values, id_company]
        );

        return result.rows[0] || null;
    }

    static async delete(id_company) {
        const result = await pool.query(
            `UPDATE company
         SET is_active = FALSE
         WHERE id_company = $1 AND is_active = TRUE
         RETURNING *`,
            [id_company]
        );
        return result.rows[0] || null;
    }
}

export default Company;
