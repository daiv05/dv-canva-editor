/**
 * useCanvasHistory.js
 *
 * Composable para manejar el historial de acciones (undo/redo) del canvas.
 *
 * Funcionalidades:
 * - Mantener historial de estados del canvas
 * - Operaciones undo/redo con límite de historial
 * - Integración transparente con useCanvasStore
 * - Estados computados para UI (canUndo, canRedo)
 * - Manejo automático de snapshots del estado
 * - Limpieza automática del historial al alcanzar límites
 */

import { ref, computed } from 'vue'
import { useCanvasStore } from './useCanvasStore'

// Estado global del historial (singleton)
const historyStack = ref([])
const currentIndex = ref(-1)
const maxHistorySize = 50 // Máximo 50 estados en el historial
const isUndoRedoOperation = ref(false)

export const useCanvasHistory = () => {
  const canvasStore = useCanvasStore()

  // Computed properties
  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < historyStack.value.length - 1)
  const historySize = computed(() => historyStack.value.length)
  const currentPosition = computed(() => currentIndex.value + 1)

  /**
   * Crear un snapshot del estado actual del canvas
   */
  const createSnapshot = () => {
    return {
      timestamp: Date.now(),
      elementos: JSON.parse(JSON.stringify(canvasStore.elementos)),
      plantas: JSON.parse(JSON.stringify(canvasStore.plantas)),
      plantaActiva: canvasStore.plantaActiva,
      elementoSeleccionado: canvasStore.elementoSeleccionado,
      vistaActiva: canvasStore.vistaActiva,
      zoom: canvasStore.zoom,
      panX: canvasStore.panX,
      panY: canvasStore.panY,
    }
  }

  /**
   * Restaurar un snapshot del estado
   */
  const restoreSnapshot = (snapshot) => {
    isUndoRedoOperation.value = true

    try {
      // Restaurar elementos
      canvasStore.elementos.splice(0, canvasStore.elementos.length, ...snapshot.elementos)

      // Restaurar plantas
      canvasStore.plantas.splice(0, canvasStore.plantas.length, ...snapshot.plantas)

      // Restaurar estado general
      canvasStore.plantaActiva = snapshot.plantaActiva
      canvasStore.elementoSeleccionado = snapshot.elementoSeleccionado
      canvasStore.vistaActiva = snapshot.vistaActiva
      canvasStore.zoom = snapshot.zoom
      canvasStore.panX = snapshot.panX
      canvasStore.panY = snapshot.panY

      console.log('📸 Estado restaurado desde snapshot:', {
        timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
        elementos: snapshot.elementos.length,
        plantaActiva: snapshot.plantaActiva,
      })
    } finally {
      isUndoRedoOperation.value = false
    }
  }

  /**
   * Agregar un nuevo estado al historial
   */
  const pushState = (description = 'Acción en canvas') => {
    // No agregar al historial si estamos en una operación undo/redo
    if (isUndoRedoOperation.value) {
      return
    }

    const snapshot = createSnapshot()
    snapshot.description = description

    // Si no estamos al final del historial, eliminar estados futuros
    if (currentIndex.value < historyStack.value.length - 1) {
      historyStack.value.splice(currentIndex.value + 1)
    }

    // Agregar nuevo estado
    historyStack.value.push(snapshot)
    currentIndex.value = historyStack.value.length - 1

    // Limitar tamaño del historial
    if (historyStack.value.length > maxHistorySize) {
      historyStack.value.shift()
      currentIndex.value = Math.max(0, currentIndex.value - 1)
    }

    console.log('💾 Estado guardado en historial:', {
      description,
      position: currentPosition.value,
      total: historySize.value,
      canUndo: canUndo.value,
      canRedo: canRedo.value,
    })
  }

  /**
   * Deshacer la última acción
   */
  const undo = () => {
    if (!canUndo.value) {
      console.warn('⚠️ No hay acciones para deshacer')
      return false
    }

    currentIndex.value--
    const snapshot = historyStack.value[currentIndex.value]

    console.log('↩️ Deshaciendo acción:', {
      description: snapshot.description,
      timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
      newPosition: currentPosition.value,
    })

    restoreSnapshot(snapshot)
    return true
  }

  /**
   * Rehacer la siguiente acción
   */
  const redo = () => {
    if (!canRedo.value) {
      console.warn('⚠️ No hay acciones para rehacer')
      return false
    }

    currentIndex.value++
    const snapshot = historyStack.value[currentIndex.value]

    console.log('↪️ Rehaciendo acción:', {
      description: snapshot.description,
      timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
      newPosition: currentPosition.value,
    })

    restoreSnapshot(snapshot)
    return true
  }

  /**
   * Limpiar todo el historial
   */
  const clearHistory = () => {
    historyStack.value = []
    currentIndex.value = -1
    console.log('🗑️ Historial limpiado completamente')
  }

  /**
   * Inicializar historial con estado inicial
   */
  const initializeHistory = (description = 'Estado inicial') => {
    clearHistory()
    pushState(description)
  }

  /**
   * Obtener información del historial para debug
   */
  const getHistoryInfo = () => {
    return {
      stack: historyStack.value.map((snapshot, index) => ({
        index,
        description: snapshot.description,
        timestamp: new Date(snapshot.timestamp).toLocaleString(),
        isCurrent: index === currentIndex.value,
        elementos: snapshot.elementos.length,
        plantaActiva: snapshot.plantaActiva,
      })),
      currentIndex: currentIndex.value,
      canUndo: canUndo.value,
      canRedo: canRedo.value,
      size: historySize.value,
    }
  }

  /**
   * Obtener el historial como lista para UI
   */
  const getHistoryList = () => {
    return historyStack.value.map((snapshot, index) => ({
      id: index,
      description: snapshot.description,
      timestamp: snapshot.timestamp,
      isCurrent: index === currentIndex.value,
      canJumpTo: true,
    }))
  }

  /**
   * Saltar a un estado específico del historial
   */
  const jumpToState = (index) => {
    if (index < 0 || index >= historyStack.value.length) {
      console.warn('⚠️ Índice de historial inválido:', index)
      return false
    }

    currentIndex.value = index
    const snapshot = historyStack.value[index]

    console.log('🎯 Saltando a estado:', {
      description: snapshot.description,
      timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
      position: index + 1,
    })

    restoreSnapshot(snapshot)
    return true
  }

  return {
    // Estado
    isUndoRedoOperation: computed(() => isUndoRedoOperation.value),

    // Computed properties
    canUndo,
    canRedo,
    historySize,
    currentPosition,

    // Métodos principales
    pushState,
    undo,
    redo,

    // Métodos de utilidad
    clearHistory,
    initializeHistory,
    getHistoryInfo,
    getHistoryList,
    jumpToState,

    // Métodos internos (para testing o casos especiales)
    createSnapshot,
    restoreSnapshot,
  }
}
