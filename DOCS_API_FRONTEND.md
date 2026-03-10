# Documentación de API - Módulos Actualizados (v2)

Esta documentación detalla los endpoints de los módulos recientemente corregidos. Todos los endpoints requieren el header `Authorization: Bearer <token>`.

## Configuración de Paginación Global (GET)

- `page` (Integer): Página actual (Default: 1).
- `limit` (Integer): Registros por página (Máximo: 100, Default: 50).

---

## 1. Perfiles de Viajero (Traveler Profiles)

`Base: /api/v2/profiles`

### Crear / Actualizar

- **POST** `/register`
- **PATCH** `/update/:id_profile`

| Campo                     | Tipo    | Requerido (Crear) | Descripción                             |
| :------------------------ | :------ | :---------------- | :-------------------------------------- |
| `user_id`                 | Integer | Sí                | ID del usuario propietario.             |
| `age`                     | Integer | No                | Edad del viajero.                       |
| `gender`                  | String  | No                | Género.                                 |
| `travel_type`             | String  | No                | Ejemplo: 'Negocios', 'Familia', 'Solo'. |
| `interests`               | String  | No                | Texto libre sobre intereses.            |
| `restrictions`            | String  | No                | Alergias o limitaciones.                |
| `sustainable_preferences` | String  | No                | Preferencias ecológicas.                |

---

## 2. Actividades Turísticas

`Base: /api/v2/tourist_activities`

### Crear / Actualizar

- **POST** `/register`
- **PATCH** `/update/:id_activity`

| Campo                  | Tipo    | Requerido | Descripción                        |
| :--------------------- | :------ | :-------- | :--------------------------------- |
| `id_company`           | Integer | Sí        | Empresa que realiza la actividad.  |
| `production_value`     | Decimal | Sí        | Valor de producción generado.      |
| `environmental_impact` | String  | No        | Descripción del impacto ambiental. |
| `social_impact`        | String  | No        | Descripción del impacto social.    |

---

## 3. Plantillas de Evaluación (Templates)

`Base: /api/v2/templates`

### Crear / Actualizar

- **POST** `/register`
- **PATCH** `/update/:id_template` (Ruta según router local)

| Campo          | Tipo    | Requerido | Descripción                            |
| :------------- | :------ | :-------- | :------------------------------------- |
| `name`         | String  | Sí        | Nombre de la rúbrica/plantilla.        |
| `version`      | String  | Sí        | Ejemplo: '1.0.0'.                      |
| `service_type` | String  | Sí        | Tipo de servicio (Hotel, Restaurante). |
| `active`       | Boolean | Sí        | Estado de la plantilla.                |

---

## 4. Criterios de Evaluación

`Base: /api/v2/criteria`

### Crear / Actualizar

- **POST** `/register`
- **PATCH** `/update/:id_criterion`

| Campo         | Tipo    | Requerido | Descripción                          |
| :------------ | :------ | :-------- | :----------------------------------- |
| `id_template` | Integer | Sí        | Plantilla a la que pertenece.        |
| `name`        | String  | Sí        | Nombre del criterio.                 |
| `description` | String  | No        | Detalles técnicos.                   |
| `weight`      | Decimal | Sí        | Peso en la calificación (0.0 a 1.0). |
| `order_index` | Integer | No        | Posición en el listado.              |
| `active`      | Boolean | Sí        | Si está vigente.                     |

---

## 5. Evaluaciones de Servicio

`Base: /api/v2/service-evaluation`

### Registrar Evaluación Completa

- **POST** `/register` (Usa el controlador `createFullEvaluationController`)

| Campo                  | Tipo    | Requerido | Descripción                              |
| :--------------------- | :------ | :-------- | :--------------------------------------- |
| `id_service`           | Integer | Sí        | ID del servicio evaluado.                |
| `id_template`          | Integer | Sí        | ID de la plantilla usada.                |
| `evaluator_id`         | Integer | Sí        | ID del usuario evaluador.                |
| `evaluation_date`      | Date    | No        | Fecha (Default: hoy).                    |
| `evaluation_time`      | String  | No        | Intervalo o duración.                    |
| `general_observations` | String  | No        | Comentarios finales.                     |
| `details`              | Array   | Sí        | Lista de objetos de detalle (ver abajo). |

**Objeto dentro de `details`:**

- `id_criterion` (Int)
- `assigned_score` (Decimal)
- `id_selected_subcriterion` (Int, Opcional)
- `observations` (String)
- `attached_evidences` (Array de strings/URLs)

---

## 6. Certificaciones de Servicio

`Base: /api/v2/service-certifications`

### Crear / Actualizar

- **POST** `/register`
- **PATCH** `/update/:id_certification`
- **PATCH** `/status/:id_certification` (Solo campo `status`)

| Campo                  | Tipo    | Requerido | Descripción                         |
| :--------------------- | :------ | :-------- | :---------------------------------- |
| `id_service`           | Integer | Sí        | Servicio que recibe el certificado. |
| `certification_type`   | String  | Sí        | Ejemplo: 'ISO 14001', 'Sello Q'.    |
| `obtainment_date`      | Date    | Sí        | Fecha de obtención.                 |
| `expiration_date`      | Date    | No        | Fecha de vencimiento.               |
| `issuing_organization` | String  | Sí        | Entidad emisora.                    |
| `evidence_url`         | String  | No        | Link al documento o imagen.         |
| `status`               | String  | Sí        | Ejemplo: 'Activo', 'Vencido'.       |

---

## 7. Puntos de Interés (POI)

`Base: /api/v2/points-of-interest`

### Crear / Actualizar

- **POST** `/register`
- **PATCH** `/update/:id_point`

| Campo            | Tipo    | Requerido | Descripción                |
| :--------------- | :------ | :-------- | :------------------------- |
| `name`           | String  | Sí        | Nombre del lugar.          |
| `description`    | String  | No        | Reseña.                    |
| `id_type`        | Integer | Sí        | ID de tipo de POI.         |
| `id_location`    | Integer | Sí        | ID de la ciudad/zona.      |
| `sustainability` | Boolean | Sí        | Si es un punto sostenible. |

---

## 8. Estadísticas y Finanzas

### Gasto Turístico (`POST /tourism-expenditures/register`)

- `id_tourist` (Int): ID del viajero/usuario.
- `expenditure_type` (String): Categoría del gasto.
- `amount` (Decimal): Monto.
- `destination` (String): Lugar del gasto.

### Empleo Turístico (`POST /tourism-employment/register`)

- `id_company` (Int): Empresa contratante.
- `position` (String): Cargo.
- `contract_type` (String): Tipo de contrato.
- `gender` (String): Género del empleado.
- `salary` (Decimal): Salario.
- `start_date` (Date): Fecha de inicio.

### Insumos Turísticos (`POST /tourism-inputs/register`)

- `id_company` (Int): Empresa.
- `input_type` (String): Tipo de insumo (Agua, Energía).
- `cost` (Decimal): Costo asociado.
- `consumption` (Decimal): Cantidad consumida.
- `carbon_footprint` (Decimal): Huella de carbono generada.

---

**Nota sobre Actualizaciones:** Los métodos `PUT /update` soportan envío parcial de datos (PATCH style). Solo se actualizarán los campos incluidos en el body de la petición.
