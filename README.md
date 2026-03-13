# Business Manager Web Client

Una aplicación web para la gestión integral de negocios, centrada en la administración de clientes, tareas y productividad. Está construida usando React, TypeScript y Vite.

## Tecnologías Principales

- **Frontend:** React 19, TypeScript
- **Estilos:** Tailwind CSS, Framer Motion para animaciones
- **Estado:** Zustand
- **Drag & Drop:** dnd-kit (para interfaces estilo Kanban)
- **Gráficos:** Recharts
- **PDF/Reportes:** jspdf, html2canvas

## Cómo levantar el proyecto localmente

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno. Crea un archivo `.env` en la raíz con las credenciales necesarias (por ejemplo, la URL del backend). Puedes usar de referencia el código para ver qué variables se necesitan.

3. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estructura del proyecto

- `src/components`: Componentes reutilizables de UI.
- `src/pages`: Las vistas principales de la aplicación.
- `src/store`: Estado global manejado con Zustand.
- `src/types`: Definiciones de tipos de TypeScript y modelos de datos.

## Capturas de pantalla

*(Añadir aquí 2 o 3 imágenes de la aplicación funcionando, por ejemplo, el dashboard y la vista de tareas. Puedes arrastrar las imágenes directamente al editor en GitHub para generar el link).*
