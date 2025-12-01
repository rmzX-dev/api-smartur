import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { swaggerSpec, swaggerUi } from './docs/swagger.js'

import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import servicesRoutes from './routes/servicesRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import touristActivitiesRoutes from './routes/touristActivitiesRoutes.js'
import templateRoutes from './routes/evaluationTemplatesRoutes.js'
import travelerProfileRoutes from './routes/travelerProfileRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import criterionRoutes from './routes/criterionRoutes.js'
import touristServicesRoutes from './routes/touristServicesRoutes.js'
import ServiceEvaluationRouter from './routes/ServiceEvaluationRoutes.js'
import evaluationDetailRouter from './routes/evaluationDetailRoutes.js'
import serviceCertificationRouter from './routes/serviceCertificationRoutes.js'
import pointOfInterestRouter from './routes/pointOfInterestRoutes.js'
import tourismExpenditureRouter from './routes/tourismExpenditureRoutes.js'
import TourismEnploymentRouter from './routes/tourismEmploymentRoutes.js'
import TourismInputRouter from './routes/tourismInputsRoutes.js'
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', userRoutes)
app.use('/api', adminRoutes)
app.use('/api', servicesRoutes)
app.use('/api', companyRoutes)
app.use('/api', touristActivitiesRoutes)
app.use('/api', templateRoutes)
app.use('/api', travelerProfileRoutes)
app.use('/api', locationRoutes)
app.use('/api', criterionRoutes)
app.use('/api', touristServicesRoutes)
app.use('/api', ServiceEvaluationRouter)
app.use('/api', evaluationDetailRouter)
app.use('/api', serviceCertificationRouter)
app.use('/api', pointOfInterestRouter)
app.use('/api', tourismExpenditureRouter)
app.use('/api', TourismEnploymentRouter)
app.use('/api', TourismInputRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
