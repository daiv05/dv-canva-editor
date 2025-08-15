<template>
  <div id="app">
    <header class="app-header">
      <h1>DV Canvas Editor</h1>
      <div class="header-center">
        <button
          @click="openHistorialModal"
          class="header-btn historial-btn"
          title="Ver historial completo"
        >
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Historial
        </button>

        <button
          @click="openImportExportModal"
          class="header-btn import-export-btn"
          title="Importar / Exportar Canvas"
        >
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          Import/Export
        </button>
      </div>
      <div class="header-info">
        <span>Editor Visual Jerárquico</span>
      </div>
    </header>

    <!-- Panel de plantas -->
    <PlantasPanel />

    <!-- Navegación jerárquica -->
    <NavegacionJerarquica />

    <main class="app-main">
      <!-- Sidebar con tabs -->
      <div class="app-sidebar-left">
        <SidebarPanel />
      </div>

      <!-- Canvas principal -->
      <div class="app-canvas">
        <CanvasView @select="handleElementSelect" @drill-down="handleDrillDown" />
      </div>

      <!-- Panel de propiedades -->
      <div class="app-sidebar-right">
        <PropiedadesPanel />
      </div>
    </main>

    <!-- Modal de historial -->
    <HistorialModal :is-open="showHistorialModal" @close="closeHistorialModal" />

    <!-- Modal de importar/exportar -->
    <ImportExportModal :mostrar="showImportExportModal" @cerrar="closeImportExportModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SidebarPanel from './components/SidebarPanel.vue'
import CanvasView from './components/CanvasView.vue'
import PlantasPanel from './components/PlantasPanel.vue'
import PropiedadesPanel from './components/PropiedadesPanel.vue'
import HistorialModal from './components/HistorialModal.vue'
import ImportExportModal from './components/ImportExportModal.vue'
import NavegacionJerarquica from './components/NavegacionJerarquica.vue'
import { useCanvasWithHistory } from './composables/useCanvasWithHistory'
import { useCanvasBuffer } from './composables/useCanvasBuffer'

// Composable para undo/redo global
const { undo, redo, store: canvasStore } = useCanvasWithHistory()
const buffer = useCanvasBuffer()

const selectedElement = ref(null)
const showHistorialModal = ref(false)
const showImportExportModal = ref(false)

const openHistorialModal = () => {
  showHistorialModal.value = true
}

const closeHistorialModal = () => {
  showHistorialModal.value = false
}

const openImportExportModal = () => {
  showImportExportModal.value = true
}

const closeImportExportModal = () => {
  showImportExportModal.value = false
}

const handleElementSelect = (elemento) => {
  selectedElement.value = elemento
  console.log('Elemento seleccionado:', elemento)
}

const handleDrillDown = (elemento) => {
  console.log('Drill down a elemento:', elemento)
  // TODO: Implementar navegación a vista hija
  alert(`Navegando a vista hija de: ${elemento.tipo} (${elemento.id})`)
}

// Atajos de teclado globales
const handleKeydown = (e) => {
  // Solo procesar si no estamos en un input
  if (e.target.matches('input, textarea, select, [contenteditable]')) {
    return
  }

  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
      e.preventDefault()
      redo()
    } else if (e.key === 'c') {
      e.preventDefault()
      handleCopyToBuffer()
    } else if (e.key === 'x') {
      e.preventDefault()
      handleMoveToBuffer()
    }
  }
}

// Handlers para buffer
const handleCopyToBuffer = () => {
  const elementoSeleccionado = canvasStore.elementoSeleccionado
  if (elementoSeleccionado) {
    buffer.copyToBuffer(elementoSeleccionado)
    console.log('📋 Elemento copiado al buffer')
  }
}

const handleMoveToBuffer = () => {
  const elementoSeleccionado = canvasStore.elementoSeleccionado
  if (elementoSeleccionado) {
    buffer.moveToBuffer(elementoSeleccionado)
    console.log('🔄 Elemento movido al buffer')
  }
}

onMounted(() => {
  // Inicializar contexto de navegación con planta por defecto
  const plantaInicial = canvasStore.plantas.find((p) => p.activa) || canvasStore.plantas[0]
  if (plantaInicial) {
    canvasStore.navegarAPlanta(plantaInicial.id)
  }

  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-header {
  background: #1e293b;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(59, 130, 246, 0.8);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-btn:hover {
  background: rgba(59, 130, 246, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.header-btn .icon {
  width: 16px;
  height: 16px;
}

.import-export-btn {
  background: rgba(34, 197, 94, 0.8) !important;
}

.import-export-btn:hover {
  background: rgba(34, 197, 94, 1) !important;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3) !important;
}

.header-info span {
  font-size: 0.875rem;
  opacity: 0.8;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-sidebar-left {
  width: 320px;
  min-width: 320px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.app-sidebar-right {
  width: 300px;
  min-width: 300px;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
}

.app-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.main-canvas {
  width: 100%;
  height: 100%;
}
</style>
