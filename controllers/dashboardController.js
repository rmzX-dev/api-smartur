import Dashboard from '../models/dashboardModel.js';

class DashboardController {
    static async getStats(req, res) {
        try {
            const stats = await Dashboard.getStats();
            res.json({
                message: 'Estadísticas del dashboard obtenidas exitosamente',
                stats,
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
}

export default DashboardController;
