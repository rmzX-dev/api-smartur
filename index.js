import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'

import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import servicesRoutes from './routes/servicesRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import touristActivitiesRoutes from './routes/touristActivitiesRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', userRoutes)
app.use('/api', adminRoutes)
app.use('/api', servicesRoutes)
app.use('/api', companyRoutes)
app.use('/api', touristActivitiesRoutes)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
