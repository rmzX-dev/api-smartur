# Resumen de Cambios para GitHub

A continuación se detalla la lista de modificaciones y nuevas implementaciones realizadas en el proyecto, basándose en los cambios actuales en el repositorio:

## 1. Configuración y Entorno
* **`.env.example`**: Se agregaron las variables `API_BIND_IP`, `API_HOST_PORT` y `GRAFANA_HOST_PORT` para la configuración de la red y métricas.
* **`Dockerfile`**: Se reemplazó `npm ci` por `npm install --omit=dev` para evitar problemas en el entorno de build a causa del `pnpm-lock.yaml`.
* **`config/db.js`**: Se configuró explícitamente el uso de `client_encoding=UTF8` en la conexión de PostgreSQL para evitar problemas con tildes y caracteres especiales, tanto en la creación de la conexión como en un listener para cada cliente conectado.

## 2. Base de Datos (`bd.sql`)
Se realizó una actualización mayor al esquema de la base de datos:
* **Campos `is_active` agregados**: Se incluyó el campo de borrado lógico (`is_active BOOLEAN DEFAULT TRUE`) en múltiples tablas (`traveler_profile`, `location`, `point_of_interest`, `company`, `tourist_activities`, `service_evaluation`, `evaluation_detail`, `service_certification`, etc.).
* **Nuevos campos en `user`**: Se agregaron `photo_url`, `avatar_icon_key` y `birth_date`.
* **Nuevos campos en otras tablas**: Se añadieron campos de `image_url` en `point_of_interest` y `tourist_service`, y `rating` en `point_of_interest`.
* **Nuevas Tablas App Móvil/Comunidad**: Se introdujeron tablas enfocadas en la comunidad y experiencia del usuario en la app:
  * `user_favorite` (para guardar lugares o servicios favoritos).
  * `user_visit` (historial de visitas a lugares).
  * `community_post` (publicaciones de los usuarios con imágenes y comentarios).
* **Nuevos Datos Semilla (Seeds Demo)**: Se expandió el demo con datos exhaustivos de ubicaciones en Veracruz (Xalapa, Coatepec, Córdoba, Orizaba, Fortín de las Flores, Xico), insertando nuevos servicios turísticos, puntos de interés con imágenes reales, roles y publicaciones de comunidad de usuarios demo.

## 3. Integración de Imágenes (Cloudinary y Multer)
* **Nuevos Archivos**: Se crearon `config/cloudinary.js` y `middleware/multer.js` (archivos no rastreados - untracked) para gestionar la subida de imágenes.
* **`controllers/pointOfInterestController.js` y `controllers/touristServicesController.js`**:
  * Se implementó una lógica (`uploadImageToCloudinary`) para subir imágenes de puntos de interés y servicios a Cloudinary cuando existe un archivo en `req.file.buffer`.
  * Las respuestas de la API ahora devuelven los campos `id_point`, `id_location`, `image_url` y `rating` estandarizados.

## 4. Perfil de Usuario y Viajero
* **`controllers/travelerProfileController.js`**: 
  * Se refactorizó `savePreferences` para utilizar una transacción (`pool.connect`) de base de datos de tal modo que guarde las preferencias de viaje y actualice `birth_date` del usuario de manera atómica (evitando inconsistencias).
  * Se creó el nuevo método `getMyProfile` dedicado a obtener el perfil del usuario autenticado en la app móvil.
* **`controllers/userController.js`**:
  * Se integró una utilidad `toPublicUser` para estandarizar los datos públicos del usuario y ocultar campos redundantes o sensibles.
  * Lógica para validar `photo_url` y `avatar_icon_key` y mejoras en listado de usuarios (`getAll`).
* **Utilidades (`utils/birthDate.js`, `utils/userPublic.js`)**: Archivos nuevos creados para normalizar/formatear fechas y formatear perfiles y respuestas de usuario.

## 5. Controladores y Rutas Varias
* **`controllers/locationController.js`**: Ahora devuelve explícitamente `id_location` además del `id`.
* **Archivos no rastreados por Git (Nuevas Características)**:
  * `controllers/exploreController.js` y `routes/exploreRoutes.js`: Nueva funcionalidad para explorar lugares y servicios.
  * `controllers/userContentController.js` y `routes/userContentRoutes.js`: Nueva lógica y rutas para el contenido generado por usuarios (comunidad/posts).
  * `models/userContentModel.js`: Modelo para accesar la base de datos de favoritos, reseñas y contenido del usuario.

## 6. Documentación
* **`docs/swagger.js`**: Actualización de la documentación de Swagger para reflejar los nuevos campos en las respuestas e incluir los nuevos endpoints añadidos.

---
**Nota**: Tienes varios archivos `Untracked` (nuevos) que necesitan ser agregados con `git add .` antes de crear el commit. Asegúrate de incluir la carpeta de rutas, modelos y validadores nuevos (`explore`, `userContent`, `cloudinary.js`, etc.).
