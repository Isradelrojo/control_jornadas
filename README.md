# 🚖 Control de Caja - Gestion_Apps (v1.0.0)

Sistema de gestión y control financiero personal diseñado para choferes de plataformas de movilidad (Uber, Cabify). Permite registrar ingresos diarios, gastos operativos y visualizar de forma clara el rendimiento neto real por día, semana y mes calendario.

## 🚀 Estado Actual (Versión 1 - Uso Personal)
La aplicación se encuentra completamente funcional, optimizada para un único usuario administrador (uso propio) y desplegada en producción (Frontend en **Vercel** y Backend en **Render** con base de datos en **MongoDB Atlas**).

### 🛠️ Tecnologías Utilizadas
* **Frontend:** React.js + Vite
* **Estilos:** CSS3 Vanilla (Diseño adaptativo / Mobile-First)
* **Gráficos e Iconos:** Recharts & Lucide React
* **Backend:** Node.js + Express.js
* **Base de Datos:** MongoDB + Mongoose (Arquitectura de modelos e indexación por rangos de fecha)

---

## 📋 Características Implementadas

### 1. Panel de Registro Diario (Frontend)
* Carga de jornadas con discriminación de ingresos por plataforma (**Uber** y **Cabify**).
* Deducción automática de costos operativos diarios: **Combustible** y **Gastos Extras** (lavadero, repuestos, viáticos).
* Procesamiento de fechas nativo forzado en formato UTC para neutralizar los husos horarios del servidor y del dispositivo móvil.

### 2. Historial Reciente y Gráfico Diario (`VistaHistorial.jsx`)
* **Gráfico de Evolución Diaria:** Representación visual rápida (Recharts) de los saldos netos de los últimos días trabajados para seguir la progresión diaria.
* **Control de Registros:** Lista cronológica del historial diario que permite visualizar de forma clara los ingresos brutos, gastos y el total neto de cada jornada.

### 3. Módulo de Estadísticas Avanzadas (`VistaEstadisticas.jsx`)
* **Gráfico de Tendencia Semanal:** Barra interactiva que muestra las últimas 4 semanas de trabajo de manera cronológica. Redirección visual de color (Verde para ganancias netas, Rojo para saldos negativos).
* **Desglose Semanal:** Lista detallada ordenable de Lunes a Domingo, calculando el neto de cada período.
* **Control de Caja Mensual Inteligente:** Tarjeta de balance automatizada que agrupa las jornadas por mes calendario puro (del día 1 al 30/31), calculando la ganancia neta exacta del vehículo según el mes en curso.

### 4. API REST & Arquitectura del Backend
* **Operaciones CRUD Completas:** Rutas totalmente desarrolladas para **Crear, Leer, Actualizar y Eliminar (Delete)** jornadas de trabajo de forma segura.
* **Controladores Inteligentes:** Lógica en el backend para buscar rangos de fechas de forma exacta (`$gte` y `$lte`).
* **Candado contra Duplicados:** Validador en el backend que impide pisar jornadas existentes por error, obligando al usuario a usar el flujo de edición desde el historial si el día ya fue registrado.

---

## 🗺️ Hoja de Ruta (Próximas Versiones)

El proyecto está diseñado estructuralmente para escalar hacia las siguientes fases de desarrollo:

* [ ] **Fase 2: Autenticación y Multi-inquilino (Web Profesional)**
  * Control de usuarios con sistema de **Registro y Login** (JWT - JSON Web Tokens / Encriptación con bcrypt).
  * Panel de administración aislado para que cualquier chofer pueda registrarse y usar la app con sus propios datos.

* [ ] **Fase 3: Migración Mobile (Play Store)**
  * Conversión de la lógica de negocio y componentes a **React Native**.
  * Compilación, optimización de interfaz táctil para Android.
  * Publicación oficial en **Google Play Store**.

---

## 💻 Instalación y Desarrollo Local

1. Clonar el repositorio.
2. Instalar las dependencias (tanto en la carpeta `/frontend` como `/backend`):
   ```bash
   npm install

## Conexion a la base de datos local y control de zonas horarias argentinas
MONGO_URI=tu_cadena_de_conexion
TZ=America/Argentina/Buenos_Aires

## Iniciar el entorno de desarrollo
npm run dev