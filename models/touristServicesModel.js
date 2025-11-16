import pool from "../config/db.js";

class TouristServices {
    static async findAllServices() {
        const result = await pool.query("SELECT * FROM tourist_service");
        return result.rows;
    }

    static async findServicesById(id_service) {
        const result = await pool.query(
            `SELECT * FROM tourist_service WHERE id_service = $1`,
            [id_service]
        );
        return result.rows[0];
    }

    static async createServices(data) {
        const {
            name,
            description,
            id_company,
            id_location,
            service_type,
            active,
        } = data;
        const result = await pool.query(
            `INSERT INTO tourist_service (name, description, id_company, id_location, service_type, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_service, name, description, id_company, id_location, service_type, active`,
            [
                name,
                description,
                id_company,
                id_location,
                service_type,
                active,
            ]
        );
        return result.rows[0];
    }

    static async deleteServices(id_service) {
        const result = await pool.query(
            `DELETE FROM tourist_service WHERE id_service = $1 RETURNING *`,
            [id_service]
        );
        return result.rows[0];
    }

    static async updateServices(id_service, data) {
        const {
            name,
            description,
            id_company,
            id_location,
            service_type,
            active,
        } = data;
        const result = await pool.query(
            `UPDATE tourist_service SET name = $1, description = $2, id_company = $3, id_location = $4, service_type = $5, active = $6 WHERE id_service = $7 RETURNING id_service, name, description, id_company, id_location, service_type, active`,
            [
                name,
                description,
                id_company,
                id_location,
                service_type,
                active,
                id_service,
            ]
        );
        return result.rows[0];
    }
}

export default TouristServices;