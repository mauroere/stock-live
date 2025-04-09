# NubeStats Insights Backend

Backend para el sistema de análisis de mercado en tiempo real.

## Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL
- Redis

## Configuración del Entorno

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
- Copiar el archivo `.env.example` a `.env`
- Ajustar las variables según tu entorno

## Estructura del Proyecto

```
src/
├── config/       # Configuraciones
├── controllers/  # Controladores
├── middlewares/  # Middleware
├── models/       # Modelos de datos
├── routes/       # Rutas de la API
├── services/     # Servicios
├── jobs/         # Trabajos programados
├── utils/        # Utilidades
└── app.ts        # Punto de entrada
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Compila el proyecto
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta las pruebas

## Base de Datos

El proyecto utiliza Sequelize como ORM para PostgreSQL. La configuración de la base de datos se encuentra en el archivo `.env`.

## API Documentation

La documentación de la API estará disponible en `/api-docs` cuando el servidor esté en ejecución.

## Desarrollo

1. Ejecutar en modo desarrollo:
```bash
npm run dev
```

2. El servidor estará disponible en `http://localhost:3000`