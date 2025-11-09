import CompanyModel from '../models/companyModel.js'

export class CompanyController {
    static async findAllCompanyController(req, res) {
        try {
            const companies = await CompanyModel.findAllCompany()
            res.json({
                message: 'Compañías obtenidas exitosamente',
                count: companies.length,
                companies: companies.map((company) => ({
                    id: company.id_company,
                    name: company.name,
                    address: company.address,
                    phone: company.phone,
                    sector: company.id_sector,
                    location: company.id_location,
                    registration_date: company.registration_date,
                })),
            })
        } catch (error) {
            console.error('Error fetching companies:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async findCompanyByIdController(req, res) {
        try {
            const companyData = await CompanyModel.findCompanyById(
                req.params.id_company
            )
            if (!companyData) {
                return res
                    .status(404)
                    .json({ message: 'Compañía no encontrada' })
            }
            res.status(200).json({
                message: 'Compañía obtenida exitosamente',
                company: {
                    id: companyData.id_company,
                    name: companyData.name,
                    address: companyData.address,
                    phone: companyData.phone,
                    sector: companyData.id_sector,
                    location: companyData.id_location,
                    registration_date: companyData.registration_date,
                },
            })
        } catch (error) {
            console.error('Error fetching company:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async createCompanyController(req, res) {
        try {
            const result = await CompanyModel.createCompany(req.body)
            res.status(201).json({
                message: 'Compañía creada exitosamente',
                company: {
                    id: result.id_company,
                    name: result.name,
                    address: result.address,
                    phone: result.phone,
                    sector: result.id_sector,
                    location: result.id_location,
                    registration_date: result.registration_date,
                },
            })
        } catch (error) {
            console.error('Error creating company:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async updateCompanyController(req, res) {
        try {
            const company = await CompanyModel.updateCompany(
                req.params.id_company,
                req.body
            )
            if (!company) {
                return res
                    .status(404)
                    .json({ message: 'Compañía no encontrada' })
            }
            res.json({
                message: 'Compañía actualizada exitosamente',
                company: {
                    id: company.id_company,
                    name: company.name,
                    address: company.address,
                    phone: company.phone,
                    sector: company.id_sector,
                    location: company.id_location,
                    registration_date: company.registration_date,
                },
            })
        } catch (error) {
            console.error('Error updating company:', error)
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            })
        }
    }

    static async deleteCompanyController(req, res) {
        try {
            const company = await CompanyModel.deleteCompany(
                req.params.id_company
            )

            if (!company) {
                return res
                    .status(404)
                    .json({ message: 'Compania no encontrada' })
            }

            res.json({
                message: 'Compania eliminada exitosamente',
                company: {
                    id: company.id_company,
                    name: company.name,
                    address: company.address,
                },
            })
        } catch (error) {
            if (error.message === 'Compania no encontrada') {
                return res.status(404).json({ message: error.message })
            }
            console.error('Error deleting company:', error)
            res.status(500).json({ message: 'Error interno del servidor' })
        }
    }
}

export default CompanyController
