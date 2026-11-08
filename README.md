# 🤟🏽 Plataforma Interactiva de LSM y Articulación Oral

> **Clave del Sistema:** `TSI-2026-MEEXUU`  
> **Marco Metodológico:** MEEXUU Framework (Fase 1: Análisis & Fase 2: Pre-producción y Diseño)  
> **Normativa de Accesibilidad:** WCAG 2.2 Nivel AAA (Contraste ≥ 7:1, Blancos Táctiles ≥ 48×48 dp), EN 301 549, ISO/IEC 25010 y Diseño Universal para el Aprendizaje (DUA Principios I, II y III).

**Señas y Sonrisas** es una plataforma educativa de Realidad Aumentada Móvil e Interacción Natural (NUI) dirigida a **niños de aproximadamente 6 años con hipoacusia** (parcial o total) en etapa de adquisición de lenguaje. Funciona como un complemento lúdico y accesible para la terapia de lenguaje formal, combinando dos módulos pedagógicos:
1. **Módulo 1 — Lengua de Señas Mexicana (LSM):** Cuentos interactivos narrados por un avatar 3D gesticulador (`MOD-3D-01`) con subtítulos sincronizados y ejercicios prácticos frente a la cámara evaluados por visión artificial.
2. **Módulo 2 — Articulación Oral (Espejo AR):** Videos y animaciones de apoyo labial en cámara lenta (`0.5x` / `1.0x`), ondas de vibración fonética continua y espejo de Realidad Aumentada para entrenar fonemas bilabiales y vocálicos (`/m/-/a/ • MA-MÁ`, `CA-SA`, `SO-PA`).

---

## 👩‍💻 Equipo de Desarrollo (ARDITAS) y Especialistas

| Integrante / Rol | Especialidad en el Proyecto (MEEXUU Framework) |
| :--- | :--- |
| **Olga Daniela Calderón Amezcua** | Investigación, Ingeniería de Requerimientos (RF/RNF) y Estrategias DUA |
| **María Fernanda Rodríguez Rodríguez** | Auditoría de Barreras de Accesibilidad (WCAG 2.2 AAA / DUA) y Arquitectura UML |
| **Evelyn Vanessa Campos Aguayo** | Arquitectura de Interacción (Casos de Uso) y Modelado Relacional de Datos |
| **Dafneé Alejandra Moreno Juárez** | Ergonomía Infantil, Selección XR/NUI, Librería 3D y Objetos Tangibles (TUI) |
| **Yaretzi Castillo Morales** | Diseño UX/UI Inclusivo, Bosquejos Gráficos DUA e Interfaces Dinámicas |
| **Dr. Luis Roberto Ramos Aguiar** | Revisor Académico — Teoría de Sistemas Interactivos |

---

## 🏛️ Arquitectura del Repositorio y 4 Capas del Sistema

El proyecto implementa una arquitectura limpia desacoplada en **4 capas** (Interfaz de Usuario + Módulo de Accesibilidad, Lógica de Aplicación, Servicios de Reconocimiento NUI/AR y Persistencia Relacional):

```text
SistemasInteractivos/
├── backend/                        # Servidor API RESTful (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/db.ts            # Pool de conexión PostgreSQL (pg) + Fallback resiliente (RNF-06)
│   │   ├── controllers/            # Controladores de Perfiles, Cuentos, Métricas y Recompensas
│   │   ├── models/types.ts         # Interfaces TypeScript alineadas al Diagrama de Clases y E-R
│   │   ├── routes/                 # Rutas modulares (/api/perfiles, /api/cuentos, /api/metricas, /api/recompensas)
│   │   ├── scripts/migrate.ts      # Script de migración SQL automatizada
│   │   └── index.ts                # Punto de entrada Express y endpoint /api/health
│   ├── .env.example                # Plantilla de variables de entorno del servidor
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # Cliente Web Accesible (React 18 + Vite + TypeScript)
│   ├── src/
│   │   ├── services/api.ts         # Cliente HTTP + Modo Offline Escolar (RNF-06)
│   │   ├── styles/accessibility.css# Librería de estilos WCAG 2.2 AAA (contraste >=7:1 y áreas >=48x48 dp)
│   │   ├── types/meexuu.ts         # Tipos de dominio del cliente
│   │   ├── views/
│   │   │   ├── InicioPerfilView.tsx        # 1. Inicio, Selección de Perfil Adaptativo y Anticipación DUA
│   │   │   ├── CatalogoCuentosView.tsx     # 2. Menú Principal, Catálogo de Cuentos, Avatar 3D y Trofeos
│   │   │   ├── ModuloLSMView.tsx           # 3. Módulo 1: LSM con Cámara AR y Visión Artificial
│   │   │   ├── ModuloArticulacionView.tsx  # 4. Módulo 2: Articulación Oral con Espejo AR y Apoyo Labial
│   │   │   └── PanelTutorView.tsx          # 5. Panel de Seguimiento Estadístico para Padres/Tutores
│   │   ├── App.tsx                 # Header DUA (Semáforo dB + Pausa Sensorial) y Navegación Accesible
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── schema.sql                  # Script DDL + Datos Semilla Oficiales (PostgreSQL 15+)
├── docker-compose.yml              # Orquestación del contenedor PostgreSQL 15 (db_meexuu)
├── .gitignore                      # Reglas globales para Node, React, TypeScript y Docker
└── README.md                       # Documentación técnica integral
```

---

## 🗄️ Modelo Relacional de Base de Datos (`/database/schema.sql`)

Basado estrictamente en la **Actividad 7 (Fase 2)**:

1. **`TABLA_TUTOR`**: Almacena las credenciales y datos del padre, madre, tutor o terapeuta (`id_tutor`, `nombre`, `email`, `password_hash`, `fecha_registro`).
2. **`TABLA_PERFIL`** (y vista compatible **`TABLA_PERFIL_NINO`**): Almacena los perfiles adaptativos del niño (`id_perfil`, `id_tutor`, `nombre_apodo`, `fecha_nacimiento`, `tipo_sordera` ENUM `['TOTAL', 'PARCIAL']`, `nivel_lectura` ENUM `['NO_LECTOR', 'LECTURA_INICIAL', 'LECTOR_AVANZADO']`, `puntos_acumulados`).
3. **`TABLA_CUENTO`**: Catálogo progresivo de cuentos por módulo (`LSM`, `ARTICULACION`) y nivel de lectura (`orden_dificultad`, `num_palabras`, `imagen_portada`, `activo`).
4. **`TABLA_EJERCICIO_CUENTO`**: Nodos de interacción con cámara dentro de cada cuento (`id_ejercicio`, `id_cuento`, `patron_referencia_id`, `palabra_o_sena`, `orden_en_cuento`).
5. **`TABLA_PROGRESO_CUENTO`**: Estado de avance del niño por cuento (`EN_PROGRESO`, `COMPLETADO`, `puntos_obtenidos`, `fecha_completado`).
6. **`TABLA_METRICA_INTENTO`**: Registro de precisión de visión artificial y articulación oral (`porcentaje_precision` DECIMAL(5,2), `resultado` ENUM `['CORRECTO', 'REINTENTO']`, `puntos_otorgados`, `fecha_hora`).
7. **`TABLA_RECOMPENSA`** y **`TABLA_CANJE_RECOMPENSA`**: Catálogo e historial de trofeos desbloqueables por puntos acumulados.

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- **Git** instalado.
- **Node.js** v18+ (recomendado v20+ o v24+) y **npm**.
- **Docker** y **Docker Compose** (para la base de datos PostgreSQL 15).

### 1. Clonar el Repositorio

```bash
git clone https://github.com/dfnmor/SistemasInteractivos.git
cd SistemasInteractivos
```

### 2. Levantar la Base de Datos PostgreSQL con Docker Compose

En la raíz del proyecto, inicia el contenedor oficial `postgres:15-alpine`:

```bash
docker-compose up -d
```

- **Puerto expuesto:** `5432`
- **Base de datos:** `db_meexuu`
- **Usuario por defecto:** `meexuu_admin`
- **Contraseña por defecto:** `meexuu_secret_2026`
- **Volumen persistente:** `meexuu_pgdata_volume`

### 3. Ejecutar las Migraciones de Base de Datos

Al levantar el contenedor por primera vez, Docker ejecuta automáticamente `/database/schema.sql` gracias al montaje en `/docker-entrypoint-initdb.d/01-schema.sql`.

Si deseas volver a aplicar o reiniciar manualmente el esquema relacional y los datos semilla en cualquier momento, puedes usar cualquiera de estos dos métodos:

**Opción A — Mediante Docker CLI:**
```bash
docker exec -i meexuu_postgres_db psql -U meexuu_admin -d db_meexuu < database/schema.sql
```

**Opción B — Mediante el script de migración del Backend:**
```bash
cd backend
npm install
npm run build
npm run db:migrate
```

### 4. Configurar y Arrancar el Backend (`/backend`)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

El servidor API estará disponible en **`http://localhost:4000`**.
- **Verificar salud de la API y conexión a Docker PostgreSQL:**
  ```bash
  curl http://localhost:4000/api/health
  ```
- **Endpoints principales:**
  - `GET /api/health` — Estado del servidor y conexión a `db_meexuu`.
  - `GET /api/perfiles` | `POST /api/perfiles` | `PUT /api/perfiles/:id` — Gestión de perfiles adaptativos (`CU-01`, `CU-02`).
  - `GET /api/cuentos` | `GET /api/cuentos/:id` | `POST /api/cuentos/:id/progreso` — Catálogo de cuentos y progreso (`CU-03`, `CU-04`).
  - `POST /api/metricas` | `GET /api/metricas/perfil/:id_perfil` — Registro de intentos de visión artificial y estadísticas del tutor (`CU-05`, `CU-06`, `CU-07`, `CU-08`).
  - `GET /api/recompensas` | `POST /api/recompensas/canjear` — Gamificación y canje de trofeos (`CU-09`).

### 5. Configurar y Arrancar el Frontend (`/frontend`)

En una nueva terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abre tu navegador en **`http://localhost:5173`**.

---

## ♿ Criterios de Accesibilidad WCAG 2.2 AAA y DUA Implementados

- **Blancos Táctiles Extendidos (WCAG 2.5.5 / 2.5.8 / EN 301 549):** Todos los botones, controles y pestañas tienen un área mínima de impacto de **≥ 48×48 dp** (54px en acciones primarias infantiles) con separación mínima de 8 dp.
- **Contraste Estricto 7:1 (WCAG 1.4.6 AAA):** Paleta diurna desaturada de alta legibilidad (relación ≥ 9.4:1 en botones primarios y 18.2:1 en texto principal) más conmutador instantáneo a **Modo Alto Contraste Nocturno AAA (>14:1)**.
- **Tipografía Accesible (WCAG 1.4.12):** Fuente **Atkinson Hyperlegible** con interlineado `1.55x` y selector de escala tipográfica (`Normal`, `Grande`, `Extra Grande`).
- **Traducción Cromático-Lumínica del Sonido (DUA Principio I):** Semáforo visual de decibeles en la barra superior (`<50 dB` Zona Segura en azul pastel, `50-65 dB` Advertencia suave, `>65 dB` atenúa automáticamente la luminancia).
- **Botón Persistente de Calma (`Pausa Sensorial` — DUA Principio III):** Silencia inmediatamente la aplicación y suaviza el brillo sin perder el progreso ni aplicar penalizaciones.
- **Retroalimentación Positiva No Punitiva (RNF-08):** Ausencia total de temporizadores regresivos o mensajes de "fallo"; los reintentos otorgan estrellas de esfuerzo y guían visualmente el encuadre de la mano o los labios.
