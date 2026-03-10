# Documentación de Endpoints: Módulo de Evaluación v2

Este documento detalla los nuevos endpoints y mejoras realizadas para el proceso de evaluación de servicios turísticos (Restaurantes, Hoteles, etc.).

## 📌 Base URL

`http://localhost:3000/api/v2`

---

## 🏛️ Plantillas y Rúbricas (Templates)

### 1. Obtener Rúbrica Completa

Devuelve la jerarquía completa de una plantilla: Template > Criterios > Subcriterios (Niveles del 0 al 4). Ideal para cargar la interfaz de evaluación dinámicamente.

- **URL:** `/templates/:id_template/rubric`
- **Método:** `GET`
- **Respuesta Exitosa (200):**

```json
{
    "message": "Rúbrica obtenida exitosamente",
    "rubric": {
        "id_template": 1,
        "name": "NOM-251 Restaurantes",
        "version": "2024.1",
        "criteria": [
            {
                "id_criterion": 5,
                "name": "Higiene y Limpieza",
                "description": "Evaluación de áreas comunes...",
                "weight": 0.25,
                "levels": [
                    {
                        "id_subcriterion": 10,
                        "description": "Totalmente insalubre",
                        "score": 0
                    },
                    {
                        "id_subcriterion": 11,
                        "description": "Cumple con estándares básicos",
                        "score": 4
                    }
                ]
            }
        ]
    }
}
```

---

## 📝 Evaluaciones de Servicio

### 2. Registro Masivo (Transaccional)

Permite guardar la cabecera de la evaluación y todos sus detalles en una sola petición. El backend calcula automáticamente el `total_score` y valida la existencia del servicio.

- **URL:** `/service-evaluation/full-register`
- **Método:** `POST`
- **Cuerpo de la Petición:**

```json
{
    "id_service": 1,
    "id_template": 1,
    "evaluator_id": 2,
    "evaluation_time": 45,
    "general_observations": "El restaurante cumple con la mayoría de puntos.",
    "details": [
        {
            "id_criterion": 5,
            "assigned_score": 4,
            "id_selected_subcriterion": 11,
            "observations": "Todo excelente",
            "attached_evidences": ["url_foto1.jpg", "url_foto2.jpg"]
        }
    ]
}
```

- **Respuesta Exitosa (201):**

```json
{
    "message": "Evaluación completa registrada con éxito",
    "evaluationId": 15,
    "finalScore": 4.0
}
```

### 3. Listar Evaluaciones (Con datos de Empresa)

Obtiene el historial de evaluaciones incluyendo el nombre del servicio, el nombre del restaurante y su dirección.

- **URL:** `/service-evaluation`
- **Método:** `GET`
- **Nuevos Campos en JSON:**
- `serviceName`: Nombre del servicio evaluado.
- `restaurantName`: Nombre de la empresa (`company`).
- `restaurantAddress`: Dirección física de la empresa.

### 4. Detalle de Evaluación

Obtiene el detalle de una evaluación específica con los datos extendidos del restaurante.

- **URL:** `/service-evaluation/:id_evaluation`
- **Método:** `GET`

---

## ✅ Mejoras Implementadas

1. **Integridad de Datos**: Uso de transacciones SQL (`BEGIN/COMMIT`) para asegurar que no se creen cabeceras sin detalles.
2. **Carga Dinámica**: El frontend ya no requiere textos "hardcoded" gracias al endpoint de rúbrica.
3. **Cálculo de Score**: El promedio/total se calcula en el servidor antes de guardar.
4. **Reportabilidad**: Las consultas de evaluación ahora devuelven información legible (Nombres de restaurantes y direcciones) mediante Joins con la tabla `company`.
