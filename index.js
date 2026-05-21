import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { swaggerSpec, swaggerUi } from './docs/swagger.js';
import { securitySwaggerSpec } from './docs/swagger.security.js';

import servicesRoutes from './routes/servicesRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import touristActivitiesRoutes from './routes/touristActivitiesRoutes.js';
import templateRoutes from './routes/evaluationTemplatesRoutes.js';
import travelerProfileRoutes from './routes/travelerProfileRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';
import criterionRoutes from './routes/criterionRoutes.js';
import touristServicesRoutes from './routes/touristServicesRoutes.js';
import serviceEvaluationRouter from './routes/serviceEvaluationRoutes.js';
import evaluationDetailRouter from './routes/evaluationDetailRoutes.js';
import serviceCertificationRouter from './routes/serviceCertificationRoutes.js';
import pointOfInterestRouter from './routes/pointOfInterestRoutes.js';
import tourismExpenditureRouter from './routes/tourismExpenditureRoutes.js';
import TourismEnploymentRouter from './routes/tourismEmploymentRoutes.js';
import TourismInputRouter from './routes/tourismInputsRoutes.js';
import UserRouter from './routes/userRoutes.js';
import UserContentRouter from './routes/userContentRoutes.js';
import SecurityRouter from './routes/securityRoutes.js';
import DashboardRouter from './routes/dashboardRoutes.js';
import SubcriterionRouter from './routes/subcriterionRoutes.js';
import ContactRouter from './routes/contactRoutes.js';
import InteractionRouter from './routes/interactionRoutes.js';
import MLRouter from './routes/mlRoutes.js';
dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                // Swagger UI usa scripts inline para inicialización.
                'script-src': ["'self'", "'unsafe-inline'"],
                'script-src-attr': ["'unsafe-inline'"],
                // En entorno local por IP (http://192.168.x.x) bloquear upgrade a https evita fallos de carga.
                'upgrade-insecure-requests': null,
            },
        },
    })
);
app.disable('x-powered-by');

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
          .map((o) => o.trim())
          .map((o) => o.replace(/\/$/, ''))
          .filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/$/, '');
const corsOptions = {
    origin: (origin, callback) => {
        const requestOrigin = normalizeOrigin(origin);
        const isLocalNetworkOrigin =
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin) ||
            /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(requestOrigin) ||
            /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(requestOrigin) ||
            /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/.test(requestOrigin);

        // Permitir requests sin Origin (como Flutter)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(requestOrigin) || isLocalNetworkOrigin) {
            return callback(null, true);
        }

        console.warn(`[CORS] Intento de acceso denegado para el origen: ${requestOrigin}. Verifica FRONTEND_URL en .env o el dashboard de despliegue.`);
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multipart lo gestiona multer por ruta; si multer no parsea (p. ej. type-is sin "body") req.body seguía undefined.
app.use((req, res, next) => {
    if (
        (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') &&
        (req.body === undefined || req.body === null)
    ) {
        req.body = {};
    }
    next();
});

// JSON en UTF-8 explícito (acentos correctos en app móvil / clientes)
app.use('/api/v2', (req, res, next) => {
    const sendJson = res.json.bind(res);
    res.json = (body) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return sendJson(body);
    };
    next();
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Demasiados intentos. Intenta de nuevo en 1 minuto.',
    },
});
app.use('/api/v2/login', authLimiter);
app.use('/api/v2/two-factor', authLimiter);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use(
    '/api-docs',
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            url: '/api-docs.json',
        },
        customSiteTitle: 'SMARTUR API Docs',
    })
);

app.use(
    '/security-docs',
    swaggerUi.serveFiles(securitySwaggerSpec),
    swaggerUi.setup(securitySwaggerSpec, {
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            docExpansion: 'list',
            filter: true,
        },
        customSiteTitle: ' SMARTUR Security Audit',
    })
);

app.use('/api/v2', servicesRoutes);
app.use('/api/v2', companyRoutes);
app.use('/api/v2', touristActivitiesRoutes);
app.use('/api/v2', templateRoutes);
app.use('/api/v2', travelerProfileRoutes);
app.use('/api/v2', locationRoutes);
app.use('/api/v2', exploreRoutes);
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
app.use('/api/v2', UserContentRouter);
app.use('/api/v2', SecurityRouter);
app.use('/api/v2', DashboardRouter);
app.use('/api/v2', SubcriterionRouter);
app.use('/api/v2', ContactRouter);
app.use('/api/v2', InteractionRouter);
app.use('/api/v2', MLRouter);


const PORT = process.env.PORT || 3000;



app.listen(PORT, '0.0.0.0', () => {
    // Servidor activo
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});