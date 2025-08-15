# DV Canvas Editor - Estructura del Proyecto

Editor visual jerárquico para distribuir elementos (anaqueles, estantes, etc.) en plantas de un edificio, con soporte de jerarquía padre-hijo, propiedades dinámicas y vistas XY / ZX / ZY.

## Tecnologías

- **Vue 3** con Composition API
- **Konva.js** y vue-konva para canvas 2D
- **Pinia** para gestión de estado
- **Tailwind CSS** para estilos
- **Vite** como bundler

## Estructura de Componentes

### `/src/components/`

- **`CanvasView.vue`** - Lienzo principal con Konva
  - Renderizado del canvas usando vue-konva
  - Manejo de eventos de interacción (drag, drop, select)
  - Gestión de transformaciones y zoom
  - Coordinación de vistas XY/ZX/ZY

- **`PlantasPanel.vue`** - Panel superior para gestión de plantas
  - Lista y selección de plantas del edificio
  - CRUD de plantas (crear, editar, eliminar)
  - Navegación entre plantas
  - Información básica de cada planta

- **`ElementosCatalogo.vue`** - Lista lateral con elementos predefinidos
  - Catálogo organizado de elementos (anaqueles, estantes, etc.)
  - Sistema de búsqueda y filtrado
  - Drag and drop hacia el canvas
  - Preview/thumbnail de elementos

- **`PropiedadesPanel.vue`** - Propiedades de elemento seleccionado
  - Edición de propiedades en tiempo real
  - Manejo de jerarquías padre-hijo
  - Validación de cambios
  - Propiedades dinámicas por tipo de elemento

- **`HistorialCambios.vue`** - Control de undo/redo
  - Botones y atajos para undo/redo
  - Visualización del historial de cambios
  - Navegación por el historial
  - Descripción de operaciones

- **`VistaSelector.vue`** - Selector de vistas (XY/ZX/ZY)
  - Botones/tabs para selección de vista
  - Coordinación con canvas para cambios de perspectiva
  - Controles específicos por vista
  - Estado independiente por vista

- **`BufferPanel.vue`** - "Caja intermedia" para mover elementos
  - Área temporal para depositar elementos
  - Drag and drop bidireccional con canvas
  - Validación antes de placement definitivo
  - Gestión de elementos "flotantes"

## Estructura de Composables

### `/src/composables/`

- **`useCanvasStore.js`** - Estado y lógica de canvas (Pinia Store)
  - Estado global del canvas (elementos, plantas, vista activa)
  - Gestión de elementos jerárquicos
  - CRUD de elementos en el canvas
  - Configuración de canvas (zoom, pan, grid)
  - Integración con otros stores

- **`useHistorial.js`** - Control de undo/redo
  - Mantener historial de operaciones
  - Lógica de undo/redo
  - Shortcuts de teclado (Ctrl+Z, Ctrl+Y)
  - Optimización de memoria del historial
  - Agrupación de operaciones relacionadas

- **`useCollision.js`** - Detección de colisiones
  - Detectar colisiones entre elementos
  - Validar posicionamiento antes de colocar
  - Feedback visual de colisiones
  - Optimización con estructuras espaciales
  - Manejo de colisiones en jerarquías

## Estructura de Utilidades

### `/src/utils/`

- **`serialization.js`** - Guardar/cargar estado
  - Serialización/deserialización a JSON
  - Versionado de formatos de guardado
  - Validación de integridad
  - Exportación en múltiples formatos
  - Migración entre versiones

- **`idGenerator.js`** - Generar IDs únicos
  - Generación de IDs únicos (UUID, incremental)
  - Validación de unicidad
  - Prefijos por tipo de elemento
  - IDs legibles para debugging
  - Generación en lote

## Estado Actual

✅ **Completado:**

- Estructura de archivos creada
- Comentarios de propósito en cada archivo
- Configuración base de componentes con Composition API
- Estructura de stores con Pinia
- Utilidades base para serialización e IDs

🔧 **Pendiente de implementar:**

- Lógica específica de cada componente
- Integración entre componentes
- Manejo de eventos y estado
- Algoritmos de colisión
- Serialización completa
- UI/UX de los paneles

## Próximos Pasos

1. **Implementar CanvasView.vue** - Canvas principal con Konva
2. **Configurar useCanvasStore.js** - Estado global del editor
3. **Desarrollar ElementosCatalogo.vue** - Catálogo de elementos
4. **Implementar sistema de drag & drop**
5. **Configurar detección de colisiones**
6. **Desarrollar sistema de historial**
7. **Implementar vistas XY/ZX/ZY**
8. **Configurar serialización completa**

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm run test:unit

# Linting
npm run lint
```
