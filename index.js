import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import servicesRoutes from './routes/servicesRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import touristActivitiesRoutes from './routes/touristActivitiesRoutes.js'
import templateRoutes from './routes/evaluationTemplatesRoutes.js'
import travelerProfileRoutes from './routes/travelerProfileRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import criterionRoutes from './routes/criterionRoutes.js'
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', userRoutes)
app.use('/api', adminRoutes)
app.use('/api', servicesRoutes)
app.use('/api', companyRoutes)
app.use('/api', touristActivitiesRoutes)
app.use('/api', templateRoutes)
app.use('/api', travelerProfileRoutes)
app.use('/api', locationRoutes)
app.use('/api', criterionRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
