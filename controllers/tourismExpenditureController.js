import TourismExpenditure from '../models/tourismExpenditureModel.js'

class TourismExpenditureController {
    static async findAllController(req, res) {
        try {
            const expenditures = await TourismExpenditure.findAll()
            res.json({
                message: 'Gastos turísticos obtenidos exitosamente',
                count: expenditures.length,
                totalAmount: expenditures.reduce(
                    (sum, item) => sum + parseFloat(item.amount),
                    0
                ),
                expenditures: expenditures.map((expenditure) => ({
                    id: expenditure.id_expenditure,
                    touristId: expenditure.id_tourist,
                    expenditureType: expenditure.expenditure_type,
                    amount: parseFloat(expenditure.amount),
                    date: expenditure.date,
                    destination: expenditure.destination,
                })),
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async findByIdController(req, res) {
        try {
            const expenditure = await TourismExpenditure.findById(
                req.params.id_expenditure
            )
            if (!expenditure) {
                return res
                    .status(404)
                    .json({ message: 'Gasto turístico no encontrado' })
            }
            res.status(200).json({
                message: 'Gasto turístico obtenido exitosamente',
                expenditure: {
                    id: expenditure.id_expenditure,
                    touristId: expenditure.id_tourist,
                    expenditureType: expenditure.expenditure_type,
                    amount: parseFloat(expenditure.amount),
                    date: expenditure.date,
                    destination: expenditure.destination,
                },
            })
        } catch (error) {
            res.status(500).json({
                message: 'Error interno en el servidor',
                error: error.message,
            })
        }
    }

    static async createController(req, res) {
        try {
            const result = await TourismExpenditure.create(req.body)
            res.status(201).json({
                message: 'Gasto turístico registrado exitosamente',
                expenditure: {
                    id: result.id_expenditure,
                    touristId: result.id_tourist,
                    expenditureType: result.expenditure_type,
                    amount: parseFloat(result.amount),
                    date: result.date,
                    destination: result.destination,
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

export default TourismExpenditureController
