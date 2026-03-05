import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { swaggerSpec, swaggerUi } from "./docs/swagger.js";
import { securitySwaggerSpec } from "./docs/swagger.security.js";

import servicesRoutes from "./routes/servicesRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import touristActivitiesRoutes from "./routes/touristActivitiesRoutes.js";
import templateRoutes from "./routes/evaluationTemplatesRoutes.js";
import travelerProfileRoutes from "./routes/travelerProfileRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import criterionRoutes from "./routes/criterionRoutes.js";
import touristServicesRoutes from "./routes/touristServicesRoutes.js";
import serviceEvaluationRouter from "./routes/serviceEvaluationRoutes.js";
import evaluationDetailRouter from "./routes/evaluationDetailRoutes.js";
import serviceCertificationRouter from "./routes/serviceCertificationRoutes.js";
import pointOfInterestRouter from "./routes/pointOfInterestRoutes.js";
import tourismExpenditureRouter from "./routes/tourismExpenditureRoutes.js";
import TourismEnploymentRouter from "./routes/tourismEmploymentRoutes.js";
import TourismInputRouter from "./routes/tourismInputsRoutes.js";
import UserRouter from "./routes/userRoutes.js";
import SecurityRouter from "./routes/securityRoutes.js";
import { connectRedis } from "./config/redis.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// ── A4: Hardening — Helmet configura cabeceras de seguridad HTTP
// Activa: X-Frame-Options (Frameguard), X-Content-Type-Options, Strict-Transport-Security, etc.
app.use(helmet());
app.disable("x-powered-by");

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// ── A4: Rate Limiting — Protección contra fuerza bruta en rutas de autenticación
// Librería: express-rate-limit  |  Archivo: index.js, línea 50
// Limita a 5 intentos por IP cada 1 minuto en /login y /two-factor
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiados intentos. Intenta de nuevo en 1 minuto.",
  },
});
app.use("/api/v2/login", authLimiter);
app.use("/api/v2/two-factor", authLimiter);

// Main Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//  Security Audit Swagger — Verifica las 5 mitigaciones OWASP
app.use(
  "/security-docs",
  swaggerUi.serve,
  swaggerUi.setup(securitySwaggerSpec, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      docExpansion: "list",
      filter: true,
    },
    customSiteTitle: " SMARTUR Security Audit",
  }),
);

app.use("/api/v2", servicesRoutes);
app.use("/api/v2", companyRoutes);
app.use("/api/v2", touristActivitiesRoutes);
app.use("/api/v2", templateRoutes);
app.use("/api/v2", travelerProfileRoutes);
app.use("/api/v2", locationRoutes);
app.use("/api/v2", criterionRoutes);
app.use("/api/v2", touristServicesRoutes);
app.use("/api/v2", serviceEvaluationRouter);
app.use("/api/v2", evaluationDetailRouter);
app.use("/api/v2", serviceCertificationRouter);
app.use("/api/v2", pointOfInterestRouter);
app.use("/api/v2", tourismExpenditureRouter);
app.use("/api/v2", TourismEnploymentRouter);
app.use("/api/v2", TourismInputRouter);
app.use("/api/v2", UserRouter);
app.use("/api/v2", SecurityRouter);

await connectRedis();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
