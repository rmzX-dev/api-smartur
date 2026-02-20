# Documentación de Módulos API v2

Este documento detalla los endpoints, parámetros y formatos de respuesta para los módulos de **Empresas**, **Servicios Turísticos** y **Ubicaciones**, los cuales incluyen paginación y filtros avanzados.

---

## 1. Módulo de Empresas (Companies)

**Base Path:** `/api/v2/companies`

### Obtener Todas (Paginado y Filtrado)

`GET /api/v2/companies`

**Parámetros Query (Opcionales):**

- `page`: Número de página (default: 1)
- `limit`: Cantidad de registros (default: 50, max: 100)
- `search`: Búsqueda por nombre (ILIKE)
- `location`: ID de ubicación (id_location)
- `sector`: ID de sector (id_sector)

**Respuesta Exitosa (JSON):**

```json
{
    "message": "Compañías obtenidas exitosamente",
    "totalRecords": 120,
    "totalPages": 3,
    "currentPage": 1,
    "companies": [
        {
            "id": 1,
            "name": "Hotel Paraíso",
            "address": "Av. Siempre Viva 123",
            "phone": "3312345678",
            "id_sector": 2,
            "id_location": 5,
            "registration_date": "2024-02-19T..."
        }
    ]
}
```

### Otros Endpoints:

- `GET /api/v2/companies/:id`: Obtiene detalle de una empresa.
- `POST /api/v2/companies`: Crea una empresa. (Requiere: `name`, `id_sector`)
- `PATCH /api/v2/companies/:id`: Actualiza campos específicos.
- `DELETE /api/v2/companies/:id`: Elimina permanentemente una empresa.

---

## 2. Módulo de Servicios Turísticos (Tourist Services)

**Base Path:** `/api/v2/tourist-services`

### Obtener Todos (Paginado y Filtrado)

`GET /api/v2/tourist-services`

**Parámetros Query (Opcionales):**

- `page`: Número de página (default: 1)
- `limit`: Cantidad de registros (default: 50)
- `search`: Búsqueda por nombre
- `company`: ID de la empresa (id_company)
- `type`: Tipo de servicio (String - 'restaurant', 'hotel', 'tour')
- `active`: 'true' para solo activos, 'false' para inactivos.

**Respuesta Exitosa (JSON):**

```json
{
    "message": "Servicios obtenidos exitosamente",
    "totalRecords": 85,
    "totalPages": 2,
    "currentPage": 1,
    "services": [
        {
            "id": 10,
            "name": "Tour de Tequila",
            "description": "Recorrido por agaveras",
            "id_company": 3,
            "id_location": 1,
            "service_type": "tour",
            "active": true,
            "created_at": "2024-02-19T..."
        }
    ]
}
```

### Otros Endpoints:

- `GET /api/v2/tourist-services/:id`: Obtiene detalle del servicio.
- `POST /api/v2/tourist-services`: Crea un servicio. (Requiere: `name`, `id_company`, `id_location`, `service_type`)
- `PATCH /api/v2/tourist-services/:id`: Actualiza campos.
- `DELETE /api/v2/tourist-services/:id`: **Borrado Lógico**. Cambia `active` a `false`.

---

## 3. Módulo de Ubicaciones (Locations)

**Base Path:** `/api/v2/locations`

### Obtener Todas (Paginado y Filtrado)

`GET /api/v2/locations`

**Parámetros Query (Opcionales):**

- `page`: Número de página (default: 1)
- `limit`: Cantidad de registros (default: 50)
- `search`: Búsqueda por nombre de la ubicación
- `state`: Filtrar por nombre del Estado (ILIKE)

**Respuesta Exitosa (JSON):**

```json
{
    "message": "Ubicaciones obtenidas exitosamente",
    "totalRecords": 45,
    "totalPages": 1,
    "currentPage": 1,
    "locations": [
        {
            "id": 1,
            "name": "Centro Histórico",
            "state": "Jalisco",
            "municipality": "Guadalajara",
            "latitude": "20.6738",
            "longitude": "-103.3444"
        }
    ]
}
```

### Otros Endpoints:

- `GET /api/v2/locations/:id`: Obtiene detalle de la ubicación.
- `POST /api/v2/locations`: Crea una ubicación. (Requiere: `name`, `state`)
- `PATCH /api/v2/locations/:id`: Actualiza campos.
- `DELETE /api/v2/locations/:id`: Elimina la ubicación de la base de datos.
