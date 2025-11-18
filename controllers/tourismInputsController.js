import TourismInputs from '../models/tourismInputsModel.js'

class TourismInputsController {
    async createController(req, res) {
        try {
            const {
                id_company,
                input_type,
                cost,
                consumption,
                carbon_footprint,
            } = req.body

            if (!id_company || !input_type || cost === undefined) {
                return res.status(400).json({
                    message: 'Campos requeridos: id_company, input_type, cost',
                    required: ['id_company', 'input_type', 'cost'],
                })
            }

            const data = {
                id_company: parseInt(id_company),
                input_type,
                cost: parseFloat(cost),
                consumption:
                    consumption !== undefined ? parseFloat(consumption) : null,
                carbon_footprint:
                    carbon_footprint !== undefined
                        ? parseFloat(carbon_footprint)
                        : null,
            }

            const result = await TourismInputs.create(data)

            res.status(201).json({
                message: 'Insumo turístico creado exitosamente',
                input: {
                    id: result.id_input,
                    companyId: result.id_company,
                    inputType: result.input_type,
                    cost: parseFloat(result.cost),
                    consumption: result.consumption
                        ? parseFloat(result.consumption)
                        : null,
                    carbonFootprint: result.carbon_footprint
                        ? parseFloat(result.carbon_footprint)
                        : null,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    async findAllController(req, res) {
        try {
            const inputs = await TourismInputs.findAll()

            const processedInputs = inputs.map((input) => ({
                id: input.id_input,
                companyId: input.id_company,
                inputType: input.input_type,
                cost: parseFloat(input.cost),
                consumption: input.consumption
                    ? parseFloat(input.consumption)
                    : null,
                carbonFootprint: input.carbon_footprint
                    ? parseFloat(input.carbon_footprint)
                    : null,
            }))

            res.json({
                message: 'Insumos turísticos obtenidos exitosamente',
                count: processedInputs.length,
                inputs: processedInputs,
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    async findByIdController(req, res) {
        try {
            const input = await TourismInputs.findById(req.params.id_input)
            if (!input) {
                return res
                    .status(404)
                    .json({ message: 'Insumo turístico no encontrado' })
            }

            res.status(200).json({
                message: 'Insumo turístico obtenido exitosamente',
                input: {
                    id: input.id_input,
                    companyId: input.id_company,
                    inputType: input.input_type,
                    cost: parseFloat(input.cost),
                    consumption: input.consumption
                        ? parseFloat(input.consumption)
                        : null,
                    carbonFootprint: input.carbon_footprint
                        ? parseFloat(input.carbon_footprint)
                        : null,
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

export default new TourismInputsController()
