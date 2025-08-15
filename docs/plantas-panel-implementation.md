# PlantasPanel.vue - Panel de Gestión de Plantas

## 🎯 Funcionalidades Implementadas

### ✅ **Panel Horizontal Superior**

- **Posicionamiento**: Ubicado entre el header y el canvas principal
- **Diseño Responsivo**: Se adapta al ancho de la pantalla
- **Scroll Horizontal**: Para manejar muchas plantas sin deformar el layout
- **Integración Visual**: Combina perfectamente con el diseño general

### ✅ **Lista de Plantas con Tarjetas**

- **Tarjetas Visuales**: Cada planta se muestra en una tarjeta con icono y nombre
- **Información Contextual**: Muestra el número de elementos por planta
- **Estado Visual**: Diferenciación clara entre planta activa e inactivas
- **Efectos Hover**: Feedback visual al pasar el mouse sobre las tarjetas

### ✅ **Selección de Planta Activa**

- **Click para Seleccionar**: Cambio de planta activa con un simple click
- **Indicador Visual**: Punto verde en la planta activa
- **Sincronización**: El canvas se actualiza automáticamente
- **Deselección Automática**: Se deselecciona elemento actual al cambiar planta

### ✅ **Sistema CRUD Completo**

#### **Agregar Plantas**

- **Modal Intuitivo**: Formulario emergente para nueva planta
- **Campos Requeridos**: Nombre obligatorio, descripción opcional
- **Validación**: Verificación de datos antes de guardar
- **Selección Automática**: La nueva planta se selecciona automáticamente

#### **Editar Plantas**

- **Edición In-Place**: Modal con datos pre-cargados de la planta actual
- **Preservación de Datos**: Mantiene elementos asociados
- **Validación**: Mismo sistema que para agregar plantas

#### **Eliminar Plantas**

- **Validación de Seguridad**: No permite eliminar plantas con elementos
- **Confirmación Modal**: Diálogo de confirmación antes de eliminar
- **Advertencias Visuales**: Mensaje claro cuando hay elementos en la planta
- **Prevención de Errores**: No se puede eliminar la última planta

### ✅ **Integración con useCanvasStore**

- **Estado Reactivo**: Cambios en el store se reflejan inmediatamente
- **Sincronización Bidireccional**: Panel actualiza store y viceversa
- **Filtrado de Elementos**: Solo muestra elementos de la planta activa
- **Gestión de IDs**: Generación automática de IDs únicos

## 🎨 **Características de UI/UX**

### **Diseño Visual**

```css
/* Tarjetas con estado visual claro */
.planta-activa {
  background-color: #eff6ff; /* Azul claro */
  border-color: #93c5fd; /* Borde azul */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.planta-inactiva {
  background-color: #f9fafb; /* Gris claro */
  border-color: #e5e7eb; /* Borde gris */
}
```

### **Iconografía**

- **Icono de Casa**: Representa cada planta visualmente
- **Iconos de Acción**: SVG para agregar, editar y eliminar
- **Indicadores**: Punto de estado para planta activa

### **Responsividad**

- **Botones Adaptativos**: Texto se oculta en pantallas pequeñas
- **Scroll Horizontal**: Para manejar muchas plantas
- **Modales Responsivos**: Se ajustan al tamaño de pantalla

## 🔧 **Estructura de Datos**

### **Formato de Planta**

```javascript
{
  id: 'planta_1',
  nombre: 'Planta Baja',
  descripcion: 'Nivel principal del edificio',
  elementos: ['elem_1', 'elem_2'],  // IDs de elementos
  activa: true
}
```

### **Integración con Elementos**

```javascript
// Los elementos incluyen referencia a su planta
{
  id: 'elem_1',
  plantaId: 'planta_1',  // Asociación con planta
  // ... otras propiedades
}
```

## ⚡ **Funcionalidades Avanzadas**

### **Validación de Eliminación**

```javascript
const eliminarPlanta = (plantaId) => {
  const elementosEnEstePlanta = elementos.value.filter((el) => el.plantaId === plantaId)

  if (elementosEnEstePlanta.length > 0) {
    throw new Error('No se puede eliminar una planta que contiene elementos')
  }
  // ... lógica de eliminación
}
```

### **Conteo Dinámico de Elementos**

```javascript
const contarElementosEnPlanta = (plantaId) => {
  return canvasStore.elementosEnPlanta(plantaId).length
}
```

### **Generación de IDs Únicos**

```javascript
const agregarPlanta = (nuevaPlanta) => {
  const id = `planta_${Date.now()}` // ID basado en timestamp
  // ... creación de planta
}
```

## 🎮 **Interacciones del Usuario**

### **Flujo de Trabajo Principal**

1. **Visualizar Plantas**: Lista horizontal con scroll
2. **Seleccionar Planta**: Click en tarjeta
3. **Ver Elementos**: Canvas se actualiza automáticamente
4. **Gestionar Plantas**: Botones de agregar/editar/eliminar

### **Flujo de Creación**

1. Click en "Agregar" → Modal se abre
2. Llenar formulario → Validación en tiempo real
3. Guardar → Nueva planta se crea y selecciona
4. Canvas → Se actualiza para mostrar nueva planta (vacía)

### **Flujo de Eliminación**

1. Click en "Eliminar" → Verificación de elementos
2. Si hay elementos → Advertencia y bloqueo
3. Si está vacía → Modal de confirmación
4. Confirmar → Planta eliminada, selección automática de otra

## 🔄 **Estados del Componente**

### **Estados de Modal**

- `mostrarModalAgregar`: Controla modal de nueva planta
- `mostrarModalEditar`: Controla modal de edición
- `mostrarConfirmacionEliminar`: Controla modal de confirmación

### **Estados de Formulario**

- `formularioPlanta`: Datos del formulario actual
- `plantaAEliminar`: Referencia a planta candidata a eliminación

### **Estados Computados**

- `elementosEnPlantaAEliminar`: Cuenta elementos en planta a eliminar
- Integración directa con computed del store

## 🚀 **Integración con Sistema General**

### **Sincronización con Canvas**

- Cambio de planta → Canvas filtra elementos automáticamente
- Elementos solo visibles de planta activa
- Deselección automática al cambiar planta

### **Coordinación con Store**

- Todas las operaciones van través del store
- Estado reactivo mantiene UI sincronizada
- Validaciones centralizadas en el store

### **Preparado para Extensiones**

- **Drag & Drop**: Base lista para reordenar plantas
- **Jerarquías**: Estructura preparada para sub-plantas
- **Metadatos**: Campos adicionales fáciles de agregar
- **Permisos**: Base para sistema de permisos por planta

## 📱 **Responsividad y Accesibilidad**

### **Breakpoints**

- **Móvil**: Iconos sin texto, scroll horizontal
- **Tablet**: Texto parcial en botones
- **Desktop**: Experiencia completa

### **Accesibilidad**

- **Títulos descriptivos**: Tooltips en botones
- **Contraste**: Colores accesibles
- **Navegación por teclado**: Formularios navegables
- **Aria Labels**: Para lectores de pantalla (pendiente)

---

## ✅ **Resultado Final**

El **PlantasPanel** está completamente implementado y funcional:

- ✅ **Panel horizontal** en la parte superior
- ✅ **Tarjetas visuales** con nombres e información
- ✅ **Selección de planta activa** con feedback visual
- ✅ **CRUD completo** con validaciones
- ✅ **Integración perfecta** con useCanvasStore
- ✅ **Estilizado con CSS nativo** (sin dependencias de Tailwind)
- ✅ **Responsivo y accesible**

El componente está listo para uso en producción y preparado para futuras extensiones del sistema de gestión de plantas.
