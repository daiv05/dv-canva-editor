# CanvasView.vue - Implementación Completa

## 🎯 Funcionalidades Implementadas

### ✅ Stage y Layer Responsivo

- **Tamaño Dinámico**: Usa `ResizeObserver` para ajustarse automáticamente al contenedor
- **Configuración Reactiva**: El stage se redimensiona cuando cambia el tamaño de la ventana
- **Contenedor Flexible**: Se adapta a diferentes resoluciones manteniendo proporciones

### ✅ Sistema de Zoom y Pan

- **Zoom con Rueda del Mouse**: Scroll para hacer zoom in/out
- **Punto Fijo de Zoom**: El zoom se centra en la posición del cursor
- **Pan con Drag**: Arrastra el canvas para navegar
- **Límites de Zoom**: Restringido entre 10% y 500%

### ✅ Renderizado de Elementos desde Store

- **Datos Reactivos**: Usa `useCanvasStore` para obtener elementos
- **Diferentes Formas**: Rectángulos para anaqueles/mesas, círculos para estantes
- **Estado Visual**: Borde diferente para elemento seleccionado
- **Sombras y Efectos**: Feedback visual mejorado

### ✅ Sistema de Selección

- **Click para Seleccionar**: Emite evento `select` con datos del elemento
- **Feedback Visual**: Borde negro grueso en elemento seleccionado
- **Información en Tiempo Real**: Panel que muestra detalles del elemento seleccionado

### ✅ Drill Down con Doble Click

- **Navegación Jerárquica**: Doble click en elementos con hijos
- **Evento Personalizado**: Emite `drill-down` para navegación
- **Validación**: Solo funciona en elementos que tienen elementos hijos

## 🔧 Mantenimiento de Proporciones en Zoom

### Algoritmo de Zoom Proporcional

```javascript
const handleWheel = (e) => {
  e.evt.preventDefault()

  const stage = stageRef.value.getNode()
  const oldScale = stage.scaleX()
  const pointer = stage.getPointerPosition()

  // 1. Calcular nueva escala
  const scaleBy = 1.1
  const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
  const clampedScale = Math.max(0.1, Math.min(5, newScale))

  // 2. Mantener punto fijo bajo el cursor
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  }

  // 3. Calcular nueva posición para mantener el punto fijo
  const newPos = {
    x: pointer.x - mousePointTo.x * clampedScale,
    y: pointer.y - mousePointTo.y * clampedScale,
  }

  // 4. Aplicar transformaciones manteniendo proporciones
  canvasStore.configurarZoom(clampedScale)
  canvasStore.configurarPan(newPos.x, newPos.y)
}
```

### Explicación del Mantenimiento de Proporciones

1. **Punto de Referencia**: Se calcula la posición del mouse en coordenadas del canvas
2. **Transformación Uniforme**: Se aplica la misma escala en X e Y (`scaleX` y `scaleY`)
3. **Reposicionamiento**: Se ajusta la posición del canvas para que el punto bajo el cursor permanezca fijo
4. **Límites**: Se mantienen límites de zoom para evitar escalas extremas

### Fórmula Matemática

```
mousePointTo = (pointer - currentPosition) / currentScale
newPosition = pointer - (mousePointTo * newScale)
```

Esto asegura que:

- El contenido bajo el cursor permanece fijo durante el zoom
- Las proporciones X:Y se mantienen constantes
- No hay distorsión visual
- La experiencia de usuario es intuitiva

## 🎮 Eventos y Interacciones

### Eventos de Elementos

- **Click**: Selección de elementos
- **Double Click**: Drill down a vista hija
- **Drag Start/End**: Movimiento de elementos con bloqueo temporal del stage

### Eventos del Stage

- **Wheel**: Zoom proporcional
- **Drag**: Pan del canvas
- **Click Global**: Deselección cuando se hace click fuera

### Gestión de Estado

- **Sincronización Reactiva**: Cambios en el store se reflejan inmediatamente
- **Persistencia**: Las transformaciones se guardan en el store
- **Validación**: Límites y restricciones aplicados automáticamente

## 🎨 Elementos Visuales

### Grid de Referencia

- Líneas de guía cada 50px
- Color sutil para no interferir con el contenido
- Se escala con el zoom para mantener consistencia

### Información en Tiempo Real

- Panel flotante con datos de zoom y vista activa
- Información del elemento seleccionado
- Posicionamiento absoluto que no interfiere con la interacción

### Estilos Adaptativos

- Bordes que cambian según selección
- Sombras para profundidad visual
- Opacidad y colores para diferenciación de tipos

## 🔗 Integración con Store

### Estado Sincronizado

```javascript
// El canvas lee directamente del store
const elementosVisibles = canvasStore.elementosVisibles
const elementoSeleccionado = canvasStore.elementoSeleccionado
const zoom = canvasStore.zoom
const panX = canvasStore.panX
const panY = canvasStore.panY
```

### Acciones del Store

```javascript
// Actualización bidireccional con el store
canvasStore.seleccionarElemento(elementoId)
canvasStore.actualizarPosicion(elementoId, x, y)
canvasStore.configurarZoom(nuevoZoom)
canvasStore.configurarPan(x, y)
```

## 🚀 Próximas Mejoras

1. **Detección de Colisiones**: Integrar con `useCollision`
2. **Historial**: Conectar con `useHistorial` para undo/redo
3. **Vistas 3D**: Implementar transformaciones para ZX/ZY
4. **Drag & Drop**: Desde catálogo de elementos
5. **Selección Múltiple**: Con Ctrl+Click o rectángulo de selección
6. **Snap to Grid**: Alineación automática a la grilla
7. **Herramientas**: Zoom fit, zoom to selection, etc.

## 📱 Responsividad

- **ResizeObserver**: Detecta cambios de tamaño del contenedor
- **Configuración Dinámica**: Stage se ajusta automáticamente
- **Mantiene Estado**: Zoom y pan se preservan durante resize
- **Performance**: Usa `nextTick` para optimizar actualizaciones
