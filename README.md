## ⚡ Instalación y Configuración

1. **Clona el repositorio**
```zsh
git clone https://github.com/rmzX-dev/api-smartur
```

2. **Accede al proyecto**
```zsh
cd api-smartur
```

3. **Instala dependencias:**
```zsh
npm install
```

4. **Configura el entorno:** Crea un archivo `.env` en la raíz con:
```
PORT=3000
DB_HOST=localhost
DB_USER={tu usuario de postgres}
DB_PASSWORD={tu contraseña de postgres}
DB_NAME={base de datos}
DB_PORT=5432
JWT_SECRET={contraseña secreta}

EMAIL_USER=smarturutcv@gmail.com
EMAIL_PASS=lihichglnpzlhddg
```

> **Nota:** No modificar EMAIL_USER & EMAIL_PASS

5. **Configura la base de datos:**
   - Asegúrate de tener PostgreSQL instalado y corriendo
   - Crea una base de datos con el nombre que especificaste en el archivo `.env`
   - Ejecuta el archivo `bd.sql` ubicado en la raíz del proyecto:

**Opción 1 - Desde psql (recomendado):**
```zsh
psql -U {tu_usuario} -d {nombre_base_datos} -f bd.sql
```

**Opción 2 - Desde pgAdmin:**
   - Abre pgAdmin y conéctate a tu servidor
   - Haz clic derecho sobre la base de datos creada y selecciona "Query Tool"
   - Abre y ejecuta el archivo `bd.sql`

6. **Inicia el servidor:**
```zsh
node index.js
```

#### 🔄 Flujo de Desarrollo

Para contribuir al proyecto, sigue estos pasos:

1. **Crea una rama nueva:**
```zsh
git checkout -b feature/nombre-de-tu-feature
```
o
```zsh
git checkout -b fix/descripcion-del-fix
```

2. **Realiza tus cambios y haz commit:**
```zsh
git add .
git commit -m "Descripción clara de los cambios"
```

3. **Sube tu rama al repositorio:**
```zsh
git push origin feature/nombre-de-tu-feature
```

4. **Crea un Pull Request:**
   - Ve al repositorio en GitHub
   - Haz clic en "Compare & pull request"
   - Describe los cambios realizados
   - Espera la revisión del código

> **Nota:** No hagas commits directamente a la rama `main`. Siempre crea una rama nueva para tus features o fixes.