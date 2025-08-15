<!--
  PlantasPanel.vue

  Panel superior para la gestión de plantas del edificio.

  Responsabilidades:
  - Mostrar lista de plantas disponibles (Planta Baja, Piso 1, etc.)
  - Permitir seleccionar la planta activa
  - Crear, editar y eliminar plantas
  - Mostrar información básica de cada planta (nombre, dimensiones)
  - Controlar la visibilidad de plantas en el canvas
  - Integrar con el sistema de navegación entre plantas
-->

<template>
  <div class="plantas-panel">
    <div class="flex items-center justify-between">
      <!-- Lista de plantas con scroll horizontal -->
      <div class="flex items-center space-x-4 flex-1 overflow-x-auto">
        <div class="flex space-x-3 min-w-max">
          <!-- Tarjetas de plantas -->
          <div
            v-for="planta in canvasStore.plantas"
            :key="planta.id"
            @click="seleccionarPlanta(planta.id)"
            :class="[
              'planta-card cursor-pointer transition-all duration-200 transform hover:scale-105',
              {
                'planta-activa': planta.id === canvasStore.plantaActiva,
                'planta-inactiva': planta.id !== canvasStore.plantaActiva,
              },
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="planta-icon">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                  />
                </svg>
              </div>
              <div class="planta-info">
                <h3 class="planta-nombre">{{ planta.nombre }}</h3>
                <p class="planta-elementos">{{ contarElementosEnPlanta(planta.id) }} elementos</p>
              </div>
            </div>

            <!-- Indicador de planta activa -->
            <div
              v-if="planta.id === canvasStore.plantaActiva"
              class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            ></div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-center space-x-2 ml-4">
        <button
          @click="mostrarModalAgregar = true"
          class="btn-action btn-primary"
          title="Agregar nueva planta"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span class="hidden sm:inline ml-1">Agregar</span>
        </button>

        <button
          @click="editarPlantaActual"
          :disabled="!canvasStore.plantaActiva"
          class="btn-action btn-secondary"
          title="Editar planta actual"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span class="hidden sm:inline ml-1">Editar</span>
        </button>

        <button
          @click="confirmarEliminarPlanta"
          :disabled="!canvasStore.plantaActiva || canvasStore.plantas.length <= 1"
          class="btn-action btn-danger"
          title="Eliminar planta actual"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span class="hidden sm:inline ml-1">Eliminar</span>
        </button>
      </div>
    </div>

    <!-- Modal para agregar/editar planta -->
    <div
      v-if="mostrarModalAgregar || mostrarModalEditar"
      class="modal-overlay"
      @click="cerrarModales"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            {{ mostrarModalEditar ? 'Editar Planta' : 'Nueva Planta' }}
          </h2>
          <button @click="cerrarModales" class="modal-close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="guardarPlanta" class="modal-body">
          <div class="form-group">
            <label for="nombre" class="form-label">Nombre de la planta</label>
            <input
              id="nombre"
              v-model="formularioPlanta.nombre"
              type="text"
              class="form-input"
              placeholder="Ej: Planta Baja, Primer Piso..."
              required
            />
          </div>

          <div class="form-group">
            <label for="descripcion" class="form-label">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              v-model="formularioPlanta.descripcion"
              class="form-textarea"
              placeholder="Descripción de la planta..."
              rows="3"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="cerrarModales" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-save">
              {{ mostrarModalEditar ? 'Guardar Cambios' : 'Crear Planta' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div
      v-if="mostrarConfirmacionEliminar"
      class="modal-overlay"
      @click="mostrarConfirmacionEliminar = false"
    >
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title text-red-600">Confirmar Eliminación</h2>
        </div>

        <div class="modal-body">
          <p class="text-gray-700 mb-4">
            ¿Estás seguro que deseas eliminar la planta
            <strong>"{{ plantaAEliminar?.nombre }}"</strong>?
          </p>

          <div
            v-if="elementosEnPlantaAEliminar > 0"
            class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-red-700 font-medium">
                Esta planta contiene {{ elementosEnPlantaAEliminar }} elemento(s). No se puede
                eliminar.
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="mostrarConfirmacionEliminar = false" class="btn-cancel">Cancelar</button>
          <button
            v-if="elementosEnPlantaAEliminar === 0"
            @click="eliminarPlantaConfirmada"
            class="btn-danger"
          >
            Eliminar Planta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCanvasStore } from '@/composables/useCanvasStore'

// Store
const canvasStore = useCanvasStore()

// Estado local para modales
const mostrarModalAgregar = ref(false)
const mostrarModalEditar = ref(false)
const mostrarConfirmacionEliminar = ref(false)
const plantaAEliminar = ref(null)

// Formulario para agregar/editar plantas
const formularioPlanta = ref({
  nombre: '',
  descripcion: '',
})

// Computed
const elementosEnPlantaAEliminar = computed(() => {
  if (!plantaAEliminar.value) return 0
  return canvasStore.elementosEnPlanta(plantaAEliminar.value.id).length
})

// Métodos
const seleccionarPlanta = (plantaId) => {
  canvasStore.seleccionarPlanta(plantaId)
}

const contarElementosEnPlanta = (plantaId) => {
  return canvasStore.elementosEnPlanta(plantaId).length
}

const editarPlantaActual = () => {
  const plantaActual = canvasStore.plantaPorId(canvasStore.plantaActiva)
  if (plantaActual) {
    formularioPlanta.value = {
      nombre: plantaActual.nombre,
      descripcion: plantaActual.descripcion || '',
    }
    mostrarModalEditar.value = true
  }
}

const confirmarEliminarPlanta = () => {
  const plantaActual = canvasStore.plantaPorId(canvasStore.plantaActiva)
  if (plantaActual) {
    plantaAEliminar.value = plantaActual
    mostrarConfirmacionEliminar.value = true
  }
}

const eliminarPlantaConfirmada = () => {
  if (plantaAEliminar.value && elementosEnPlantaAEliminar.value === 0) {
    try {
      canvasStore.eliminarPlanta(plantaAEliminar.value.id)
      mostrarConfirmacionEliminar.value = false
      plantaAEliminar.value = null
    } catch (error) {
      console.error('Error al eliminar planta:', error)
      alert(error.message)
    }
  }
}

const guardarPlanta = () => {
  if (!formularioPlanta.value.nombre.trim()) {
    alert('El nombre de la planta es requerido')
    return
  }

  try {
    if (mostrarModalEditar.value) {
      // Editar planta existente
      canvasStore.editarPlanta(canvasStore.plantaActiva, {
        nombre: formularioPlanta.value.nombre.trim(),
        descripcion: formularioPlanta.value.descripcion.trim(),
      })
    } else {
      // Agregar nueva planta
      const nuevaPlantaId = canvasStore.agregarPlanta({
        nombre: formularioPlanta.value.nombre.trim(),
        descripcion: formularioPlanta.value.descripcion.trim(),
      })
      // Seleccionar la nueva planta
      canvasStore.seleccionarPlanta(nuevaPlantaId)
    }

    cerrarModales()
  } catch (error) {
    console.error('Error al guardar planta:', error)
    alert('Error al guardar la planta')
  }
}

const cerrarModales = () => {
  mostrarModalAgregar.value = false
  mostrarModalEditar.value = false
  formularioPlanta.value = {
    nombre: '',
    descripcion: '',
  }
}
</script>

<style scoped>
.plantas-panel {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Tarjetas de plantas */
.planta-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 2px solid;
  min-width: max-content;
  transition: all 0.2s;
}

.planta-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.planta-activa {
  background-color: #eff6ff;
  border-color: #93c5fd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.planta-inactiva {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.planta-inactiva:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.planta-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.planta-nombre {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.planta-elementos {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Botones de acción */
.btn-action {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-action:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #4b5563;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #374151;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 28rem;
  width: 100%;
  margin: 1rem;
  max-height: 100vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 24rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #4b5563;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Formularios */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: none;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  color: #374151;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-save {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background-color: #1d4ed8;
}

/* Utilidades */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.flex-1 {
  flex: 1;
}

.overflow-x-auto {
  overflow-x: auto;
}

.min-w-max {
  min-width: max-content;
}

.ml-4 {
  margin-left: 1rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.w-5 {
  width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}

.w-3 {
  width: 0.75rem;
}

.h-3 {
  height: 0.75rem;
}

.absolute {
  position: absolute;
}

.-top-1 {
  top: -0.25rem;
}

.-right-1 {
  right: -0.25rem;
}

.bg-green-500 {
  background-color: #10b981;
}

.rounded-full {
  border-radius: 50%;
}

.border-2 {
  border-width: 2px;
}

.border-white {
  border-color: white;
}

.hidden {
  display: none;
}

@media (min-width: 640px) {
  .sm\:inline {
    display: inline;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.text-red-600 {
  color: #dc2626;
}

.text-gray-700 {
  color: #374151;
}

.text-red-500 {
  color: #ef4444;
}

.text-red-700 {
  color: #b91c1c;
}

.font-medium {
  font-weight: 500;
}

.bg-red-50 {
  background-color: #fef2f2;
}

.border {
  border-width: 1px;
}

.border-red-200 {
  border-color: #fecaca;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}
</style>
