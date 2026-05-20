import Location from '../models/locationModel.js';
import TouristServices from '../models/touristServicesModel.js';
import PointOfInterest from '../models/pointOfInterestModel.js';

/**
 * Payload único para la app móvil (Home): ubicaciones activas con
 * servicios turísticos activos y puntos de interés por ciudad.
 * Evita N+1 requests (locations + servicios + POIs por cada location).
 */
class ExploreController {
    static async getHome(req, res) {
        try {
            const locResult = await Location.findAll(1, 100, '', '');
            // active=null: mostrar todos los servicios activos e inactivos para que el admin vea
            // lo que agregó. La UI móvil filtra por categoría, no por estado.
            const svcResult = await TouristServices.findAll(1, 500, '', null, null, null, null);
            const poiResult = await PointOfInterest.findAll(1, 500, '', null, null, null);

            // ── Agrupar por ubicación ──────────────────────────────────────
            const ORPHAN_ID = '__orphan__';
            const servicesByLocation = new Map();
            for (const s of svcResult.services) {
                const lid = s.id_location ?? ORPHAN_ID;
                if (!servicesByLocation.has(lid)) servicesByLocation.set(lid, []);
                servicesByLocation.get(lid).push({
                    id: s.id_service,
                    id_service: s.id_service,
                    name: s.name,
                    description: s.description,
                    id_company: s.id_company,
                    id_location: s.id_location,
                    service_type: s.service_type,
                    active: s.active,
                    id_evaluation: s.id_evaluation,
                    total_score: s.total_score,
                    image_url: s.image_url || null,
                    created_at: s.created_at,
                });
            }

            const pointsByLocation = new Map();
            for (const p of poiResult.points) {
                const lid = p.id_location ?? ORPHAN_ID;
                if (!pointsByLocation.has(lid)) pointsByLocation.set(lid, []);
                pointsByLocation.get(lid).push({
                    id: p.id_point,
                    id_point: p.id_point,
                    name: p.name,
                    description: p.description,
                    typeId: p.id_type,
                    id_type: p.id_type,
                    locationId: p.id_location,
                    id_location: p.id_location,
                    sustainability: p.sustainability,
                    image_url: p.image_url || null,
                    rating: p.rating != null ? parseFloat(p.rating) : 4.0,
                });
            }

            // ── Construir ciudades ─────────────────────────────────────────
            const cities = locResult.locations.map((l) => {
                const id = l.id_location;
                return {
                    id_location: id,
                    name: l.name,
                    state: l.state,
                    municipality: l.municipality,
                    latitude: l.latitude != null ? parseFloat(l.latitude) : null,
                    longitude: l.longitude != null ? parseFloat(l.longitude) : null,
                    services: servicesByLocation.get(id) ?? [],
                    points: pointsByLocation.get(id) ?? [],
                };
            });

            // ── Agrupar huérfanos en la primera ciudad disponible ──────────
            // Servicios/POIs sin id_location se asignan a la primera ciudad para
            // que siempre sean visibles. Si no hay ciudades, se agregan al final.
            const orphanServices = servicesByLocation.get(ORPHAN_ID) ?? [];
            const orphanPoints = pointsByLocation.get(ORPHAN_ID) ?? [];

            if (orphanServices.length > 0 || orphanPoints.length > 0) {
                if (cities.length > 0) {
                    cities[0].services.push(...orphanServices);
                    cities[0].points.push(...orphanPoints);
                } else {
                    cities.push({
                        id_location: null,
                        name: 'Altas Montañas',
                        state: 'Veracruz',
                        municipality: null,
                        latitude: 19.0,
                        longitude: -97.0,
                        services: orphanServices,
                        points: orphanPoints,
                    });
                }
            }

            res.json({
                message: 'Datos de exploración (home)',
                cities,
            });
        } catch (error) {
            console.error('ExploreController.getHome:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
}

export default ExploreController;
