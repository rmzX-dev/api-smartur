import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { swaggerSpec, swaggerUi } from './docs/swagger.js';

import servicesRoutes from './routes/servicesRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import touristActivitiesRoutes from './routes/touristActivitiesRoutes.js';
import templateRoutes from './routes/evaluationTemplatesRoutes.js';
import travelerProfileRoutes from './routes/travelerProfileRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import criterionRoutes from './routes/criterionRoutes.js';
import touristServicesRoutes from './routes/touristServicesRoutes.js';
import serviceEvaluationRouter from './routes/serviceEvaluationRoutes.js';
import evaluationDetailRouter from './routes/evaluationDetailRoutes.js';
import serviceCertificationRouter from './routes/serviceCertificationRoutes.js';
import pointOfInterestRouter from './routes/pointOfInterestRoutes.js';
import tourismExpenditureRouter from './routes/tourismExpenditureRoutes.js';
import TourismEnploymentRouter from './routes/tourismEmploymentRoutes.js';
import TourismInputRouter from './routes/tourismInputsRoutes.js';
import UserRouter from './routes/userRoutes.js'
import { connectRedis } from './config/redis.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v2', servicesRoutes);
app.use('/api/v2', companyRoutes);
app.use('/api/v2', touristActivitiesRoutes);
app.use('/api/v2', templateRoutes);
app.use('/api/v2', travelerProfileRoutes);
app.use('/api/v2', locationRoutes);
app.use('/api/v2', criterionRoutes);
app.use('/api/v2', touristServicesRoutes);
app.use('/api/v2', serviceEvaluationRouter);
app.use('/api/v2', evaluationDetailRouter);
app.use('/api/v2', serviceCertificationRouter);
app.use('/api/v2', pointOfInterestRouter);
app.use('/api/v2', tourismExpenditureRouter);
app.use('/api/v2', TourismEnploymentRouter);
app.use('/api/v2', TourismInputRouter);
app.use('/api/v2', UserRouter);

await connectRedis();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
