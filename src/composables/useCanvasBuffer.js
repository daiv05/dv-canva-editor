/**
 * useCanvasBuffer.js
 *
 * Composable para manejar el buffer/clipboard de elementos del canvas.
 *
 * Funcionalidades:
 * - Almacenar elementos temporalmente en buffer
 * - Mover elementos entre plantas
 * - Restaurar elementos a su ubicación original
 * - Drag & drop desde buffer al canvas
 * - Gestión de estado del buffer
 */

import { ref, computed } from 'vue'
import { useCanvasStore } from './useCanvasStore'

// Estado global del buffer (singleton)
const bufferItems = ref([])

export const useCanvasBuffer = () => {
  const canvasStore = useCanvasStore()

  // Computed properties
  const hasItems = computed(() => bufferItems.value.length > 0)
  const itemCount = computed(() => bufferItems.value.length)

  /**
   * Crear un item del buffer con metadata de origen
   */
  const createBufferItem = (elemento, sourceInfo = {}) => {
    return {
      id: `buffer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalId: elemento.id,
      elemento: JSON.parse(JSON.stringify(elemento)), // Deep clone
      sourceInfo: {
        plantaId: elemento.plantaId || canvasStore.plantaActiva,
        position: { x: elemento.x, y: elemento.y },
        timestamp: Date.now(),
        ...sourceInfo,
      },
      addedToBuffer: Date.now(),
    }
  }

  /**
   * Agregar elemento al buffer
   */
  const addToBuffer = (elemento, sourceInfo = {}) => {
    if (!elemento) {
      console.warn('⚠️ No se puede agregar elemento vacío al buffer')
      return false
    }

    // Verificar si el elemento ya está en el buffer
    const existingIndex = bufferItems.value.findIndex((item) => item.originalId === elemento.id)

    if (existingIndex !== -1) {
      // Actualizar elemento existente en buffer
      const updatedItem = createBufferItem(elemento, sourceInfo)
      bufferItems.value[existingIndex] = updatedItem
      console.log('📋 Elemento actualizado en buffer:', updatedItem.elemento.nombre)
    } else {
      // Agregar nuevo elemento al buffer
      const bufferItem = createBufferItem(elemento, sourceInfo)
      bufferItems.value.push(bufferItem)
      console.log('📋 Elemento agregado al buffer:', bufferItem.elemento.nombre)
    }

    return true
  }

  /**
   * Mover elemento al buffer (elimina del canvas y agrega al buffer)
   */
  const moveToBuffer = (elementoId, description = 'Elemento movido al buffer') => {
    const elemento = canvasStore.elementoPorId(elementoId)
    if (!elemento) {
      console.warn('⚠️ Elemento no encontrado para mover al buffer:', elementoId)
      return false
    }

    // Crear info de origen
    const sourceInfo = {
      action: 'moved',
      description,
      originalPlanta: elemento.plantaId,
      originalPosition: { x: elemento.x, y: elemento.y },
    }

    // Agregar al buffer
    const success = addToBuffer(elemento, sourceInfo)
    if (success) {
      // Eliminar del canvas
      canvasStore.eliminarElemento(elementoId)
      console.log('🔄 Elemento movido al buffer:', elemento.nombre)
      return true
    }

    return false
  }

  /**
   * Copiar elemento al buffer (mantiene en canvas)
   */
  const copyToBuffer = (elementoId, description = 'Elemento copiado al buffer') => {
    const elemento = canvasStore.elementoPorId(elementoId)
    if (!elemento) {
      console.warn('⚠️ Elemento no encontrado para copiar al buffer:', elementoId)
      return false
    }

    const sourceInfo = {
      action: 'copied',
      description,
      originalPlanta: elemento.plantaId,
      originalPosition: { x: elemento.x, y: elemento.y },
    }

    const success = addToBuffer(elemento, sourceInfo)
    if (success) {
      console.log('📋 Elemento copiado al buffer:', elemento.nombre)
    }

    return success
  }

  /**
   * Restaurar elemento a su ubicación original
   */
  const restoreToOriginal = (bufferItemId) => {
    const bufferItem = bufferItems.value.find((item) => item.id === bufferItemId)
    if (!bufferItem) {
      console.warn('⚠️ Item no encontrado en buffer:', bufferItemId)
      return false
    }

    const { elemento, sourceInfo } = bufferItem

    // Restaurar al canvas en la planta y posición original
    const restoredElement = {
      ...elemento,
      id: elemento.id, // Mantener ID original para restauración
      plantaId: sourceInfo.plantaId,
      x: sourceInfo.position.x,
      y: sourceInfo.position.y,
    }

    // Verificar si el elemento ya existe en el canvas
    const existingElement = canvasStore.elementoPorId(elemento.id)
    if (existingElement) {
      // Si existe, actualizar posición
      canvasStore.actualizarElemento(elemento.id, {
        plantaId: sourceInfo.plantaId,
        x: sourceInfo.position.x,
        y: sourceInfo.position.y,
      })
    } else {
      // Si no existe, agregarlo
      canvasStore.agregarElemento(restoredElement)
    }

    // Remover del buffer
    removeFromBuffer(bufferItemId)

    console.log('🔄 Elemento restaurado a ubicación original:', elemento.nombre)
    return true
  }

  /**
   * Pegar elemento desde buffer al canvas actual
   */
  const pasteFromBuffer = (bufferItemId, position = { x: 100, y: 100 }) => {
    const bufferItem = bufferItems.value.find((item) => item.id === bufferItemId)
    if (!bufferItem) {
      console.warn('⚠️ Item no encontrado en buffer:', bufferItemId)
      return false
    }

    const { elemento } = bufferItem

    // Crear nuevo elemento en la planta actual
    const newElement = {
      ...elemento,
      id: `${elemento.tipo}_${Date.now()}`, // Nuevo ID único
      plantaId: canvasStore.plantaActiva,
      x: position.x,
      y: position.y,
    }

    // Agregar al canvas
    canvasStore.agregarElemento(newElement)
    console.log('📋 Elemento pegado desde buffer:', newElement.nombre)

    // Si era un elemento movido (no copiado), remover del buffer
    if (bufferItem.sourceInfo.action === 'moved') {
      removeFromBuffer(bufferItemId)
    }

    return newElement.id
  }

  /**
   * Remover elemento del buffer
   */
  const removeFromBuffer = (bufferItemId) => {
    const index = bufferItems.value.findIndex((item) => item.id === bufferItemId)
    if (index !== -1) {
      const removedItem = bufferItems.value.splice(index, 1)[0]
      console.log('🗑️ Elemento removido del buffer:', removedItem.elemento.nombre)
      return true
    }
    return false
  }

  /**
   * Limpiar todo el buffer
   */
  const clearBuffer = () => {
    const count = bufferItems.value.length
    bufferItems.value = []
    console.log(`🗑️ Buffer limpiado - ${count} elementos removidos`)
  }

  /**
   * Obtener elemento del buffer por ID
   */
  const getBufferItem = (bufferItemId) => {
    return bufferItems.value.find((item) => item.id === bufferItemId)
  }

  /**
   * Obtener todos los elementos del buffer
   */
  const getBufferItems = () => {
    return bufferItems.value
  }

  /**
   * Verificar si un elemento está en el buffer
   */
  const isInBuffer = (elementoId) => {
    return bufferItems.value.some((item) => item.originalId === elementoId)
  }

  /**
   * Obtener información para debug
   */
  const getBufferInfo = () => {
    return {
      items: bufferItems.value.map((item) => ({
        id: item.id,
        originalId: item.originalId,
        nombre: item.elemento.nombre,
        tipo: item.elemento.tipo,
        sourceAction: item.sourceInfo.action,
        sourcePlanta: item.sourceInfo.plantaId,
        addedAt: new Date(item.addedToBuffer).toLocaleString(),
      })),
      count: itemCount.value,
      hasItems: hasItems.value,
    }
  }

  return {
    // Estado
    bufferItems: computed(() => bufferItems.value),
    hasItems,
    itemCount,

    // Métodos principales
    addToBuffer,
    moveToBuffer,
    copyToBuffer,
    pasteFromBuffer,
    restoreToOriginal,
    removeFromBuffer,
    clearBuffer,

    // Métodos de consulta
    getBufferItem,
    getBufferItems,
    isInBuffer,
    getBufferInfo,
  }
}
