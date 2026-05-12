import pool from '../config/db.js';

class Dashboard {
    static async getStats() {
        const queries = {
            totalLocations: pool.query(`SELECT COUNT(*) FROM location WHERE is_active = TRUE`),
            totalServices: pool.query(`SELECT COUNT(*) FROM tourist_service WHERE active = TRUE`),
            totalUsers: pool.query(`SELECT COUNT(*) FROM "user"`),
            activeUsers: pool.query(`SELECT COUNT(*) FROM "user" WHERE is_active = TRUE`),
            totalEvaluations: pool.query(`SELECT COUNT(*) FROM service_evaluation WHERE is_active = TRUE`),
            avgScore: pool.query(`SELECT COALESCE(AVG(total_score), 0) FROM service_evaluation WHERE is_active = TRUE`),
            totalCompanies: pool.query(`SELECT COUNT(*) FROM company WHERE is_active = TRUE`),
            totalPOI: pool.query(`SELECT COUNT(*) FROM point_of_interest WHERE is_active = TRUE`),
            evaluationsByMonth: pool.query(`
                SELECT 
                    TO_CHAR(created_at, 'YYYY-MM') as month,
                    COUNT(*) as count,
                    AVG(total_score) as avg_score
                FROM service_evaluation 
                WHERE is_active = TRUE AND created_at >= NOW() - INTERVAL '12 months'
                GROUP BY TO_CHAR(created_at, 'YYYY-MM')
                ORDER BY month ASC
            `),
            topServices: pool.query(`
                SELECT 
                    se.id_service,
                    ts.name as service_name,
                    c.name as company_name,
                    AVG(se.total_score) as avg_score,
                    COUNT(*) as evaluation_count
                FROM service_evaluation se
                INNER JOIN tourist_service ts ON se.id_service = ts.id_service
                INNER JOIN company c ON ts.id_company = c.id_company
                WHERE se.is_active = TRUE
                GROUP BY se.id_service, ts.name, c.name
                ORDER BY avg_score DESC
                LIMIT 5
            `),
            recentEvaluations: pool.query(`
                SELECT 
                    se.id_evaluation,
                    se.total_score,
                    se.created_at,
                    ts.name as service_name,
                    u.name as evaluator_name
                FROM service_evaluation se
                INNER JOIN tourist_service ts ON se.id_service = ts.id_service
                INNER JOIN "user" u ON se.evaluator_id = u.user_id
                WHERE se.is_active = TRUE
                ORDER BY se.created_at DESC
                LIMIT 10
            `),
            usersByRole: pool.query(`
                SELECT role_id, COUNT(*) as count
                FROM "user"
                GROUP BY role_id
            `),
        };

        const results = await Promise.allSettled(Object.values(queries));
        const keys = Object.keys(queries);

        const data = {};
        keys.forEach((key, index) => {
            const result = results[index];
            data[key] = result.status === 'fulfilled' ? result.value.rows : [];
        });

        return {
            total_locations: parseInt(data.totalLocations[0]?.count || 0),
            total_services: parseInt(data.totalServices[0]?.count || 0),
            total_users: parseInt(data.totalUsers[0]?.count || 0),
            active_users: parseInt(data.activeUsers[0]?.count || 0),
            total_evaluations: parseInt(data.totalEvaluations[0]?.count || 0),
            average_score: parseFloat(data.avgScore[0]?.coalesce || 0).toFixed(2),
            total_companies: parseInt(data.totalCompanies[0]?.count || 0),
            total_poi: parseInt(data.totalPOI[0]?.count || 0),
            evaluations_by_month: data.evaluationsByMonth,
            top_services: data.topServices,
            recent_evaluations: data.recentEvaluations,
            users_by_role: data.usersByRole,
        };
    }
}

export default Dashboard;
