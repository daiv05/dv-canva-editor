<!--
  ElementosCatalogo.vue
  Panel lateral con catálogo de elementos predefinidos para arrastrar al canvas.
-->

<template>
  <div class="elementos-catalogo">
    <!-- Header del catálogo -->
    <div class="catalogo-header">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Catálogo de Elementos</h2>

      <!-- Barra de búsqueda -->
      <div class="search-container">
        <div class="relative">
          <input
            v-model="filtroTexto"
            type="text"
            placeholder="Buscar elementos..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            class="w-5 h-5 text-gray-400 absolute top-2.5 left-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
      </div>

      <!-- Filtros por categoría -->
      <div class="categorias-filter">
        <div class="flex gap-2 flex-wrap mb-4">
          <button
            @click="filtroCategoria = null"
            :class="[
              'px-3 py-1 text-sm rounded-full border transition-colors',
              !filtroCategoria
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300',
            ]"
          >
            Todos
          </button>
          <button
            v-for="categoria in categorias"
            :key="categoria"
            @click="filtroCategoria = categoria"
            :class="[
              'px-3 py-1 text-sm rounded-full border transition-colors capitalize',
              filtroCategoria === categoria
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300',
            ]"
          >
            {{ categoria }}
          </button>
        </div>
      </div>

      <!-- Botón para crear elemento personalizado -->
      <button
        @click="abrirModalCreacion"
        class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        + Crear Elemento Personalizado
      </button>
    </div>

    <!-- Lista de elementos -->
    <div class="elementos-lista">
      <div v-if="elementosFiltrados.length === 0" class="no-elementos">
        <p class="text-gray-500">No se encontraron elementos</p>
      </div>

      <div
        v-for="elemento in elementosFiltrados"
        :key="elemento.id"
        class="elemento-card"
        :style="{ borderLeftColor: getColorCategoria(elemento.categoria) }"
        :draggable="true"
        @dragstart="iniciarArrastre($event, elemento)"
        @dragend="finalizarArrastre"
      >
        <!-- Preview visual del elemento -->
        <div class="elemento-preview">
          <div
            class="preview-shape"
            :class="[`shape-${elemento.forma}`, elemento.montado === 'pared' ? 'wall-mounted' : '']"
            :style="{
              backgroundColor: elemento.color,
              width: `${Math.min(48, elemento.width / 10)}px`,
              height: `${Math.min(32, elemento.height / 10)}px`,
            }"
          >
            <span class="text-xs text-white font-bold">{{
              elemento.tipo.charAt(0).toUpperCase()
            }}</span>
          </div>
        </div>

        <!-- Información del elemento -->
        <div class="elemento-info">
          <h3 class="font-semibold text-sm text-gray-800 mb-1">{{ elemento.nombre }}</h3>
          <p class="text-xs text-gray-500 mb-2">{{ elemento.descripcion }}</p>

          <!-- Especificaciones -->
          <div class="elemento-specs">
            <div class="spec-item">
              <span class="spec-label">Dimensiones:</span>
              <span class="spec-value">{{ elemento.width }}×{{ elemento.height }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Capacidad:</span>
              <span class="spec-value">{{ elemento.capacidad }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Material:</span>
              <span class="spec-value">{{ elemento.material }}</span>
            </div>
          </div>
        </div>

        <!-- Indicador de arrastre -->
        <div class="drag-indicator">
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Modal para crear elemento personalizado -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="text-xl font-semibold">Crear Elemento Personalizado</h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="crearElemento" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Información básica -->
            <div class="form-group">
              <label class="form-label">Nombre del elemento</label>
              <input
                v-model="nuevoElemento.nombre"
                type="text"
                required
                class="form-input"
                placeholder="Ej: Estante personalizado"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Categoría</label>
              <select v-model="nuevoElemento.categoria" required class="form-input">
                <option value="">Seleccionar categoría</option>
                <option v-for="cat in categorias" :key="cat" :value="cat">
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Ancho (cm)</label>
              <input
                v-model.number="nuevoElemento.width"
                type="number"
                required
                min="10"
                max="500"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Alto (cm)</label>
              <input
                v-model.number="nuevoElemento.height"
                type="number"
                required
                min="10"
                max="300"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Forma</label>
              <select v-model="nuevoElemento.forma" required class="form-input">
                <option value="rectangular">Rectangular</option>
                <option value="cuadrado">Cuadrado</option>
                <option value="circular">Circular</option>
                <option value="triangular">Triangular</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Color</label>
              <input v-model="nuevoElemento.color" type="color" class="form-input h-10" />
            </div>

            <div class="form-group md:col-span-2">
              <label class="form-label">Descripción</label>
              <textarea
                v-model="nuevoElemento.descripcion"
                rows="3"
                class="form-textarea"
                placeholder="Descripción del elemento personalizado..."
              ></textarea>
            </div>

            <!-- Preview del elemento -->
            <div class="md:col-span-2">
              <label class="form-label">Vista previa</label>
              <div class="preview-container">
                <div class="preview-card">
                  <div
                    class="preview-shape mr-3"
                    :class="`shape-${nuevoElemento.forma}`"
                    :style="{
                      backgroundColor: nuevoElemento.color,
                      width: '48px',
                      height: '32px',
                    }"
                  >
                    <span class="text-xs text-white font-bold">
                      {{ nuevoElemento.nombre.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium">{{ nuevoElemento.nombre || 'Nuevo elemento' }}</p>
                    <p class="text-sm text-gray-500">
                      {{ nuevoElemento.width }}×{{ nuevoElemento.height }} cm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                @click="cerrarModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear Elemento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ELEMENTOS_PREDEFINIDOS } from '@/utils/constants.js'

// Referencias reactivas
const filtroTexto = ref('')
const filtroCategoria = ref(null)
const mostrarModal = ref(false)
const elementosDragging = ref(false)

// Elementos personalizados guardados en localStorage
const elementosPersonalizados = ref([])

// Formulario para nuevo elemento
const nuevoElemento = ref({
  nombre: '',
  categoria: '',
  width: 100,
  height: 60,
  forma: 'rectangular',
  color: '#3B82F6',
  descripcion: '',
  capacidad: 'Variable',
  material: 'Personalizado',
  montado: 'suelo',
})

// Computed
const categorias = computed(() => {
  const cats = new Set()
  ELEMENTOS_PREDEFINIDOS.forEach((el) => cats.add(el.categoria))
  elementosPersonalizados.value.forEach((el) => cats.add(el.categoria))
  return Array.from(cats)
})

const todosLosElementos = computed(() => {
  return [...ELEMENTOS_PREDEFINIDOS, ...elementosPersonalizados.value]
})

const elementosFiltrados = computed(() => {
  let elementos = todosLosElementos.value

  // Filtrar por texto
  if (filtroTexto.value) {
    const texto = filtroTexto.value.toLowerCase()
    elementos = elementos.filter(
      (el) =>
        el.nombre.toLowerCase().includes(texto) ||
        el.categoria.toLowerCase().includes(texto) ||
        el.descripcion.toLowerCase().includes(texto),
    )
  }

  // Filtrar por categoría
  if (filtroCategoria.value) {
    elementos = elementos.filter((el) => el.categoria === filtroCategoria.value)
  }

  return elementos
})

// Métodos
const getColorCategoria = (categoria) => {
  const colores = {
    anaqueles: '#3B82F6',
    estantes: '#10B981',
    mesas: '#F59E0B',
    armarios: '#8B5CF6',
    contenedores: '#EF4444',
  }
  return colores[categoria] || '#6B7280'
}

const iniciarArrastre = (event, elemento) => {
  elementosDragging.value = true
  event.dataTransfer.setData('application/json', JSON.stringify(elemento))
  event.dataTransfer.effectAllowed = 'copy'

  // Agregar clase visual
  event.target.classList.add('dragging')
}

const finalizarArrastre = (event) => {
  elementosDragging.value = false
  event.target.classList.remove('dragging')
}

const abrirModalCreacion = () => {
  mostrarModal.value = true
  resetFormulario()
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const resetFormulario = () => {
  nuevoElemento.value = {
    nombre: '',
    categoria: '',
    width: 100,
    height: 60,
    forma: 'rectangular',
    color: '#3B82F6',
    descripcion: '',
    capacidad: 'Variable',
    material: 'Personalizado',
    montado: 'suelo',
  }
}

const crearElemento = () => {
  const elemento = {
    id: `custom-${Date.now()}`,
    tipo: nuevoElemento.value.nombre.toLowerCase().replace(/\s+/g, '-'),
    ...nuevoElemento.value,
    personalizado: true,
  }

  elementosPersonalizados.value.push(elemento)
  guardarElementosPersonalizados()
  cerrarModal()
}

const cargarElementosPersonalizados = () => {
  try {
    const guardados = localStorage.getItem('elementos-personalizados')
    if (guardados) {
      elementosPersonalizados.value = JSON.parse(guardados)
    }
  } catch (error) {
    console.error('Error cargando elementos personalizados:', error)
  }
}

const guardarElementosPersonalizados = () => {
  try {
    localStorage.setItem('elementos-personalizados', JSON.stringify(elementosPersonalizados.value))
  } catch (error) {
    console.error('Error guardando elementos personalizados:', error)
  }
}

// Lifecycle
onMounted(() => {
  cargarElementosPersonalizados()
})
</script>

<style scoped>
@reference '@/styles/index.css';

.elementos-catalogo {
  @apply h-full flex flex-col bg-white border-r border-gray-200;
}

.catalogo-header {
  @apply p-4 border-b border-gray-200;
}

.elementos-lista {
  @apply flex-1 overflow-y-auto p-4;
}

.elemento-card {
  @apply relative bg-white border border-gray-200 rounded-lg p-3 cursor-grab mb-3;
  @apply hover:shadow-md transition-all duration-200 border-l-4;
}

.elemento-card:hover {
  @apply scale-[1.02];
}

.elemento-card.dragging {
  @apply opacity-50 scale-95;
}

.elemento-preview {
  @apply flex items-center justify-center mb-3;
}

.preview-shape {
  @apply w-12 h-8 rounded flex items-center justify-center relative;
  @apply shadow-sm border border-white/20;
}

.shape-rectangular {
  @apply rounded-sm;
}

.shape-circular {
  @apply rounded-full;
}

.shape-triangular {
  @apply rounded-sm;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.shape-cuadrado {
  @apply rounded-sm aspect-square;
}

.wall-mounted::after {
  content: '';
  @apply absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full;
}

.elemento-info {
  @apply space-y-1;
}

.elemento-specs {
  @apply space-y-1;
}

.spec-item {
  @apply flex justify-between text-xs;
}

.spec-label {
  @apply text-gray-500 font-medium;
}

.spec-value {
  @apply text-gray-700;
}

.drag-indicator {
  @apply absolute top-2 right-2 opacity-0 transition-opacity;
}

.elemento-card:hover .drag-indicator {
  @apply opacity-100;
}

.no-elementos {
  @apply text-center py-12;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200;
}

.modal-body {
  @apply p-6;
}

.form-group {
  @apply space-y-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg resize-none;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.preview-container {
  @apply bg-gray-50 rounded-lg p-4;
}

.preview-card {
  @apply flex items-center p-3 bg-white rounded border;
}
</style>
