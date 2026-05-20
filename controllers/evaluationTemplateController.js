import evaluationTemplate from '../models/evaluationTemplateModel.js';

class templateController {
    static async findTemplateController(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const search = req.query.search || '';
            const service_type = req.query.service_type || '';
            const active = req.query.active !== undefined ? req.query.active === 'true' : null;

            const result = await evaluationTemplate.findTemplate(
                page,
                limit,
                search,
                service_type,
                active
            );

            res.json({
                message: 'Templates obtenidas exitosamente',
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                templates: result.templates.map((template) => ({
                    id: template.id_template,
                    name: template.name,
                    version: template.version,
                    servicio: template.service_type,
                    estado: template.active,
                    register_at: template.creation_date,
                })),
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async findTemplateByIdController(req, res) {
        try {
            const template = await evaluationTemplate.findTemplateByid(req.params.id_template);
            if (!template) {
                return res.status(404).json({ message: 'Template no encontrado' });
            }
            res.status(200).json({
                message: 'Template obtenido exitosamente',
                template: {
                    id: template.id_template,
                    name: template.name,
                    version: template.version,
                    servicio: template.service_type,
                    estado: template.active,
                    register_at: template.creation_date,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async createTemplateController(req, res) {
        try {
            const { name, version, service_type, active } = req.body;

            const template = await evaluationTemplate.createTemplate({
                name,
                version,
                service_type,
                active,
            });

            res.status(201).json({
                message: 'Template creada exitosamente',
                template: {
                    id: template.id_template,
                    name: template.name,
                    version: template.version,
                    servicio: template.service_type,
                    estado: template.active,
                    register_at: template.creation_date,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async deleteTemplateController(req, res) {
        try {
            const template = await evaluationTemplate.deleteTemplate(req.params.id_template);
            if (!template) {
                return res.status(404).json({ message: 'Template no encontrado' });
            }
            res.status(200).json({
                message: 'Template eliminado exitosamente',
                template: {
                    id: template.id_template,
                    name: template.name,
                    version: template.version,
                    servicio: template.service_type,
                    estado: template.active,
                    register_at: template.creation_date,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async updateTemplateController(req, res) {
        try {
            const template = await evaluationTemplate.updateTemplate(
                req.params.id_template,
                req.body
            );
            if (!template) {
                return res.status(404).json({ message: 'Template no encontrado' });
            }
            res.status(200).json({
                message: 'Template actualizado exitosamente',
                template: {
                    id: template.id_template,
                    name: template.name,
                    version: template.version,
                    servicio: template.service_type,
                    estado: template.active,
                    register_at: template.creation_date,
                },
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }

    static async getRubricController(req, res) {
        try {
            const rubric = await evaluationTemplate.getFullRubric(req.params.id_template);
            if (!rubric) {
                return res.status(404).json({ message: 'Template no encontrado' });
            }
            res.status(200).json({
                message: 'Rúbrica obtenida exitosamente',
                rubric,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            });
        }
    }
}

export default templateController;
