# 🤟🏽 Plataforma Interactiva de LSM y Articulación Oral

> **Clave del Sistema:** `TSI-2026-MEEXUU`  
> **Marco Metodológico:** MEEXUU Framework (Fase 1: Análisis, Fase 2: Diseño y Evaluación DIX09)  
> **Normativa de Accesibilidad:** WCAG 2.2 Nivel AAA (Contraste ≥ 7:1, Blancos Táctiles ≥ 48×48 dp), EN 301 549, ISO/IEC 25010 y Diseño Universal para el Aprendizaje (DUA Principios I, II y III).

**Señas y Sonrisas** es un sistema interactivo accesible conectado de punta a punta a **PostgreSQL 15+**, diseñado para **niños de 6 años con hipoacusia** (parcial o total) en etapa de adquisición de Lengua de Señas Mexicana (LSM) y articulación oral.

---

## 🔄 Flujo Funcional de Punta a Punta (Conectado a PostgreSQL)

1. **Selección de Perfil Adaptativo (`/`)**: Carga desde `TABLA_PERFIL` los perfiles de ejemplo con hipoacusia parcial (`Mateo`) e hipoacusia total (`Sofía`), permitiendo crear nuevos perfiles o ajustar su nivel de lectura (`NO_LECTOR`, `LECTURA_INICIAL`, `LECTOR_AVANZADO`).
2. **Catálogo de Cuentos (`/cuentos`)**: Consulta desde `TABLA_CUENTO` los **9 cuentos (3 por cada nivel de lectura)** junto con sus ejercicios reales de `TABLA_EJERCICIO_CUENTO` y el estado de avance en `TABLA_PROGRESO_CUENTO`.
3. **Narrativa de Cuento y Nodos de Práctica**: Reproduce el cuento con el Avatar 3D `MOD-3D-01` y redirige al ejercicio seleccionado frente a la cámara.
4. **Práctica de Seña — Módulo 1 (`/practica-v1` y `/practica-v2`)**:
   - Activa la cámara real del dispositivo mediante `navigator.mediaDevices.getUserMedia` con el contorno guía superpuesto sobre el video.
   - Permite evaluar la seña con reconocimiento simulado aleatorio o mediante los botones de prueba **«Simular acierto»** y **«Simular fallo»**, guardando **cada intento en `TABLA_METRICA_INTENTO`** vía API (`POST /api/metricas`).
5. **Mejoras de Usabilidad y Accesibilidad DIX09 (`/practica-v2`)**:
   - **a) Cuenta regresiva visual 3-2-1** con íconos grandes y **sin sonido** antes de activar la cámara.
   - **b) Marco animado alrededor del contorno guía** que cambia de aspecto cuando se detecta al niño en el encuadre.
   - **c) Retroalimentación formativa ante fallos**: Reproduce automáticamente la seña de referencia en **cámara lenta (`0.5x`)** con el mensaje **«¡Casi! Intenta otra vez»**, ícono de ánimo (`💪🌟`) y contador de **hasta 3 intentos sin penalización**.
   - **d) Botón grande y siempre visible «Ver seña de nuevo»** (`≥ 48×48 dp`).
   - **e) Multimodalidad y Contraste AAA**: Retroalimentación que combina siempre **ícono + texto + color**, con botones `≥ 48×48 dp` y relación de contraste `≥ 7:1`.
6. **Puntos y Canje de Recompensas**: Al acertar un ejercicio o completar un cuento se suman puntos en `TABLA_PERFIL` en PostgreSQL y se muestran en tiempo real en la barra superior. El niño puede canjear sus puntos por cualquiera de las recompensas de `TABLA_RECOMPENSA`, registrando el canje en `TABLA_CANJE_RECOMPENSA`.
7. **Panel del Tutor (`/tutor`)**: Muestra en vivo desde PostgreSQL el progreso por cuento (`TABLA_PROGRESO_CUENTO`), el historial de intentos (`TABLA_METRICA_INTENTO`), la precisión promedio y las recompensas canjeadas (`TABLA_CANJE_RECOMPENSA`).

---

## 📸 Rutas para Comparativa Antes / Después (DIX09)

Ambas versiones del Módulo 1 se encuentran activas y conectadas a PostgreSQL para facilitar la toma de capturas y la demostración en video:

- **Versión 1 (Original, antes de DIX09):** `http://localhost:5173/practica-v1` (o botón inferior `3a. LSM v1 (Antes)`).
- **Versión 2 (Mejorada con DIX09):** `http://localhost:5173/practica-v2` (o botón inferior `3b. LSM v2 (DIX09)`).

---

## 🚀 Pasos Exactos para Levantar el Sistema Completo

### 1. Clonar el Repositorio

```bash
git clone https://github.com/dfnmor/SistemasInteractivos.git
cd SistemasInteractivos
```

### 2. Levantar PostgreSQL 15 con Docker Compose

```bash
docker-compose up -d
```

Verifica que el contenedor `meexuu_postgres_db` esté corriendo en el puerto `5432`:

```bash
docker ps
```

### 3. Ejecutar `schema.sql` y `seed.sql` en PostgreSQL (`db_meexuu`)

Al iniciar el contenedor por primera vez, Docker ejecuta automáticamente `/database/schema.sql` y `/database/seed.sql`. Para ejecutarlos o recargarlos manualmente en cualquier momento:

**Opción A — Usando Docker CLI:**
```bash
docker exec -i meexuu_postgres_db psql -U meexuu_admin -d db_meexuu < database/schema.sql
docker exec -i meexuu_postgres_db psql -U meexuu_admin -d db_meexuu < database/seed.sql
```

**Opción B — Usando el script automatizado del Backend:**
```bash
cd backend
npm install
npm run db:migrate
```
*(Este comando aplica en orden `/database/schema.sql` y `/database/seed.sql`, insertando 1 tutor, 2 perfiles de ejemplo con sordera parcial y total, 9 cuentos —3 por nivel—, 27 ejercicios y 3 recompensas).*

### 4. Levantar el Servidor Backend (`/backend`)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

- Servidor activo en: `http://localhost:4000`
- Endpoint de verificación de salud y conexión a PostgreSQL: `http://localhost:4000/api/health`

### 5. Levantar la Aplicación Frontend (`/frontend`)

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

- Cliente web activo en: `http://localhost:5173`

---

## 👩‍💻 Equipo de Desarrollo (ARDITAS)

- **Olga Daniela Calderón Amezcua** — Investigación, Requerimientos y Estrategias DUA
- **María Fernanda Rodríguez Rodríguez** — Accesibilidad WCAG 2.2 AAA / DUA y Arquitectura UML
- **Evelyn Vanessa Campos Aguayo** — Casos de Uso y Modelado Relacional de Datos
- **Dafneé Alejandra Moreno Juárez** — Ergonomía Infantil, XR/NUI, Librería 3D y Objetos Tangibles (TUI)
- **Yaretzi Castillo Morales** — Diseño UX/UI Inclusivo, Bosquejos Gráficos e Interfaces Dinámicas
- **Revisor Académico:** Dr. Luis Roberto Ramos Aguiar
