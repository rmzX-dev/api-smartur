import TourismEmployment from '../models/tourismEmploymentModel.js'

class TourismEmploymentController {
    async createController(req, res) {
        try {
            const { id_company, position, contract_type, gender, salary, start_date } = req.body;
            
            if (!id_company || !position || !contract_type || !gender || salary === undefined || !start_date) {
                return res.status(400).json({
                    message: 'Todos los campos son requeridos',
                    required: ['id_company', 'position', 'contract_type', 'gender', 'salary', 'start_date']
                });
            }

            const salaryValue = typeof salary === 'string' ? parseFloat(salary) : salary;
            
            const data = {
                id_company: parseInt(id_company),
                position,
                contract_type,
                gender,
                salary: salaryValue,
                start_date
            };

            const result = await TourismEmployment.create(data)
            
            res.status(201).json({
                message: 'Empleo turístico creado exitosamente',
                employment: {
                    id: result.id_employment,
                    companyId: result.id_company,
                    position: result.position,
                    contractType: result.contract_type,
                    gender: result.gender,
                    salary: parseFloat(result.salary),
                    startDate: result.start_date,
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
            const employments = await TourismEmployment.findAll()
            
            const processedEmployments = employments.map((employment) => ({
                id: employment.id_employment,
                companyId: employment.id_company,
                position: employment.position,
                contractType: employment.contract_type,
                gender: employment.gender,
                salary: parseFloat(employment.salary),
                startDate: employment.start_date,
            }));

            res.json({
                message: 'Empleos turísticos obtenidos exitosamente',
                count: processedEmployments.length,
                employments: processedEmployments,
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
            const employment = await TourismEmployment.findById(req.params.id_employment)
            if (!employment) {
                return res
                    .status(404)
                    .json({ message: 'Empleo turístico no encontrado' })
            }
            
            res.status(200).json({
                message: 'Empleo turístico obtenido exitosamente',
                employment: {
                    id: employment.id_employment,
                    companyId: employment.id_company,
                    position: employment.position,
                    contractType: employment.contract_type,
                    gender: employment.gender,
                    salary: parseFloat(employment.salary),
                    startDate: employment.start_date,
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

export default new TourismEmploymentController()