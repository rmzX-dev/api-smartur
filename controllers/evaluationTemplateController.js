import evaluationTemplate from '../models/evaluationTemplateModel.js'

class templateController {
    static async findTemplateController(req, res) {
        try {
            const templates = await evaluationTemplate.findTemplate()

            res.json({
                message: 'Templates obtenidas exitosamente',
                count: templates.length,
                templates: templates.map((template) => ({
                    id: template.id_template,
                    name: template.name,
                    version: template.version,
                    servicio: template.service_type,
                    estado: template.active,
                    register_at: template.creation_date,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findTemplateByIdController(req, res) {
        try {
            const template = await evaluationTemplate.findTemplateByid(
                req.params.id_template
            )
            if (!template) {
                return res
                    .status(404)
                    .json({ message: 'Template no encontrado' })
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
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async createTemplateController(req, res) {
        try {
            const { name, version, service_type, active } = req.body

            const template = await evaluationTemplate.createTemplate({
                name,
                version,
                service_type,
                active,
            })

            res.json({
                message: 'Template creada exitosamente',
                template: {
                    id: template.id_template,
                    name: template.name,
                    version: template.version,
                    servicio: template.service_type,
                    estado: template.active,
                    register_at: template.creation_date,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async deleteTemplateController(req, res) {
        try {
            const template = await evaluationTemplate.deleteTemplate(
                req.params.id_template
            )
            if (!template) {
                return res
                    .status(404)
                    .json({ message: 'Template no encontrado' })
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
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }
}

export default templateController
