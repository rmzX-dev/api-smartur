# Documentación de Rutas con Paginación y Filtros

Se ha implementado un sistema estándar de paginación y filtrado en todos los módulos de la API. Este documento detalla cómo utilizar estas nuevas capacidades en los endpoints `GET`.

## Parámetros Globales (Query Params)

En casi todos los endpoints de listado, puedes usar:

- `page`: Número de página (Default: 1).
- `limit`: Registros por página (Default: 50, Máximo: 100).
- `search`: Texto para búsqueda (varía según el módulo).

---

## 1. Usuarios (Users)

`GET /api/v3/users`

- **Filtros:**
    - `role`: ID del rol (Ej: `/users?role=1`).
    - `search`: Busca por nombre o email.

## 2. Perfiles de Viajero (Traveler Profiles)

`GET /api/v3/profiles`

- **Filtros:**
    - `gender`: Género del viajero.
    - `travel_type`: Tipo de viaje (Ej: 'Solo', 'Familia').
    - `search`: Busca por ID de usuario.

## 3. Evaluaciones de Servicio (Service Evaluations)

`GET /api/v3/evaluations` (Ruta según `serviceEvaluationRoutes.js`)

- **Filtros:**
    - `id_service`: Filtrar por ID de un servicio específico.
    - `status`: Estado de la evaluación (Ej: 'Completado', 'Pendiente').
    - `evaluator_id`: ID del usuario que evaluó.

## 4. Certificaciones (Certifications)

`GET /api/v3/certifications`

- **Filtros:**
    - `id_service`: Certificaciones de un servicio.
    - `certification_type`: Tipo de certificación.
    - `status`: Estado.

## 5. Otros Módulos Actualizados

### Empresas (Companies)

`GET /api/v3/companies`

- `location`: ID de localización.
- `sector`: ID de sector.

### Puntos de Interés (Points of Interest)

`GET /api/v3/points`

- `id_location`: Filtrar por ubicación.
- `id_type`: Filtrar por tipo de POI.
- `sustainability`: Booleano (true/false).

### Turismo Aplicado

- `GET /api/v3/tourism-employment`: Filtros por `id_company`, `gender`, `contract_type`.
- `GET /api/v3/tourism-expenditure`: Filtros por `id_tourist`, `expenditure_type`, `destination`.
- `GET /api/v3/tourism-inputs`: Filtros por `id_company`, `input_type`.

---

## Estructura de Respuesta Estándar

Todas las peticiones exitosas devolverán un objeto con metadatos de paginación:

```json
{
  "message": "...",
  "totalRecords": 150,
  "totalPages": 3,
  "currentPage": 1,
  "data": [ ... ]
}
```

_Nota: El nombre de la propiedad que contiene el arreglo de datos (`users`, `profiles`, `evaluations`, etc.) coincide con el nombre del módulo en plural._
