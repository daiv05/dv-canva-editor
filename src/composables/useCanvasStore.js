/**
 * useCanvasStore.js
 *
 * Store principal para el estado y lógica del canvas del editor visual jerárquico.
 *
 * Responsabilidades:
 * - Estado global del canvas (elementos, plantas, vista  const eliminarElemento = (elementoId) => {
    const elemento = elementos.value.find((el) => el.id === elementoId)
    const index = elementos.value.findIndex((el) => el.id === elementoId)

    if (index > -1) {
      elementos.value.splice(index, 1)

      // Si se elimina el elemento seleccionado, deseleccionar
      if (elementoSeleccionado.value === elementoId) {
        elementoSeleccionado.value = null
      }

      // Guardar estado en historial
      saveToHistory(`Elemento eliminado: ${elemento?.nombre || elemento?.tipo || elementoId}`)
    }
  }

  const toggleElementoVisibilidad = (elementoId) => {
    const elemento = elementos.value.find((el) => el.id === elementoId)
    if (elemento) {
      // Si no tiene propiedad visible, por defecto está visible (true)
      elemento.visible = elemento.visible === false ? true : false

      // Guardar estado en historial
      const estado = elemento.visible ? 'mostrado' : 'ocultado'
      saveToHistory(`Elemento ${estado}: ${elemento.nombre || elemento.tipo}`)
    }
  }stión de elem    // Actions - Plantas
    seleccionarPlanta,
    agregarPlanta,
    editarPlanta,
    eliminarPlanta,

    // Actions - Elementos
    agregarElemento,
    eliminarElemento
  }jerárquicos (padre-hijo)
 * - Estado de selección y herramientas activas
 * - Configuración de canvas (zoom, pan, grid)
 * - CRUD de elementos en el canvas
 * - Gestión de plantas y navegación entre ellas
 * - Estado de las vistas XY/ZX/ZY
 * - Integración con otros stores y composables
 * - Persistencia y sincronización del estado
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Variable para evitar circular import - será inicializada por el composable de historial
let historyComposable = null

export const useCanvasStore = defineStore('canvas', () => {
  // Estado de plantas
  const plantas = ref([
    {
      id: 'planta_1',
      nombre: 'Planta Baja',
      descripcion: 'Nivel principal del edificio',
      elementos: ['elem_1', 'elem_2'],
      activa: true,
    },
    {
      id: 'planta_2',
      nombre: 'Primer Piso',
      descripcion: 'Segundo nivel del edificio',
      elementos: ['elem_3'],
      activa: false,
    },
    {
      id: 'planta_3',
      nombre: 'Segundo Piso',
      descripcion: 'Tercer nivel del edificio',
      elementos: [],
      activa: false,
    },
  ])

  const plantaActiva = ref('planta_1')

  // Estado básico para desarrollo
  const elementos = ref([])

  const elementoSeleccionado = ref(null)
  const vistaActiva = ref('XY') // XY, ZX, ZY
  const zoom = ref(1)
  const panX = ref(0)
  const panY = ref(0)

  // Getters
  const elementosVisibles = computed(() => {
    const visibles = elementos.value.filter((el) => el.plantaId === plantaActiva.value)
    console.log('Elementos visibles calculados:', {
      plantaActiva: plantaActiva.value,
      totalElementos: elementos.value.length,
      elementosVisibles: visibles.length,
      elementos: visibles,
    })
    return visibles
  })

  const elementoPorId = computed(() => (id) => {
    return elementos.value.find((el) => el.id === id)
  })

  const plantaPorId = computed(() => (id) => {
    return plantas.value.find((planta) => planta.id === id)
  })

  const plantaActivaData = computed(() => {
    return plantas.value.find((planta) => planta.id === plantaActiva.value)
  })

  const elementosEnPlanta = computed(() => (plantaId) => {
    return elementos.value.filter((el) => el.plantaId === plantaId)
  })

  const elementoSeleccionadoCompleto = computed(() => {
    if (!elementoSeleccionado.value) return null
    return elementos.value.find((el) => el.id === elementoSeleccionado.value)
  })

  // Actions
  const seleccionarElemento = (id) => {
    elementoSeleccionado.value = id
  }

  const actualizarPosicion = (id, x, y) => {
    const elemento = elementos.value.find((el) => el.id === id)
    if (elemento) {
      elemento.x = x
      elemento.y = y
    }
  }

  const actualizarElemento = (elementoId, propiedades) => {
    const elemento = elementos.value.find((el) => el.id === elementoId)
    if (elemento) {
      Object.assign(elemento, propiedades)
    }
  }

  const cambiarVista = (nuevaVista) => {
    vistaActiva.value = nuevaVista
  }

  const configurarZoom = (nuevoZoom) => {
    zoom.value = Math.max(0.1, Math.min(5, nuevoZoom))
  }

  const configurarPan = (x, y) => {
    panX.value = x
    panY.value = y
  }

  // Actions para plantas
  const seleccionarPlanta = (plantaId) => {
    plantaActiva.value = plantaId
    // Deseleccionar elemento al cambiar de planta
    elementoSeleccionado.value = null
  }

  const agregarPlanta = (nuevaPlanta) => {
    const id = `planta_${Date.now()}`
    plantas.value.push({
      id,
      nombre: nuevaPlanta.nombre || 'Nueva Planta',
      descripcion: nuevaPlanta.descripcion || '',
      elementos: [],
      activa: false,
      ...nuevaPlanta,
    })
    return id
  }

  const editarPlanta = (plantaId, datosActualizados) => {
    const planta = plantas.value.find((p) => p.id === plantaId)
    if (planta) {
      Object.assign(planta, datosActualizados)
    }
  }

  const eliminarPlanta = (plantaId) => {
    const elementosEnEstePlanta = elementos.value.filter((el) => el.plantaId === plantaId)

    if (elementosEnEstePlanta.length > 0) {
      throw new Error('No se puede eliminar una planta que contiene elementos')
    }

    const index = plantas.value.findIndex((p) => p.id === plantaId)
    if (index > -1) {
      plantas.value.splice(index, 1)

      // Si se elimina la planta activa, cambiar a la primera disponible
      if (plantaActiva.value === plantaId && plantas.value.length > 0) {
        plantaActiva.value = plantas.value[0].id
      }
    }
  }

  // Actions para elementos
  const agregarElemento = (nuevoElemento) => {
    console.log('Agregando elemento al store:', nuevoElemento)
    elementos.value.push(nuevoElemento)
    console.log('Total elementos en store:', elementos.value.length)
    console.log('Elementos en planta activa:', elementosVisibles.value.length)

    // Guardar estado en historial
    saveToHistory(`Elemento agregado: ${nuevoElemento.nombre || nuevoElemento.tipo}`)

    return nuevoElemento.id
  }

  const eliminarElemento = (elementoId) => {
    const elemento = elementos.value.find((el) => el.id === elementoId)
    const index = elementos.value.findIndex((el) => el.id === elementoId)

    if (index > -1) {
      elementos.value.splice(index, 1)

      // Deseleccionar si era el elemento seleccionado
      if (elementoSeleccionado.value === elementoId) {
        elementoSeleccionado.value = null
      }

      // Guardar estado en historial
      saveToHistory(`Elemento eliminado: ${elemento?.nombre || elemento?.tipo || elementoId}`)
    }
  }

  const toggleElementoVisibilidad = (elementoId) => {
    const elemento = elementos.value.find((el) => el.id === elementoId)
    if (elemento) {
      // Si no tiene propiedad visible, por defecto está visible (true)
      elemento.visible = elemento.visible === false ? true : false

      // Guardar estado en historial
      const estado = elemento.visible ? 'mostrado' : 'ocultado'
      saveToHistory(`Elemento ${estado}: ${elemento.nombre || elemento.tipo}`)
    }
  }

  // === INTEGRACIÓN CON HISTORIAL ===

  /**
   * Inicializar la integración con el historial
   */
  const initializeHistory = (historyComposableInstance) => {
    historyComposable = historyComposableInstance

    // Guardar estado inicial
    if (historyComposable) {
      historyComposable.initializeHistory('Estado inicial del canvas')
    }
  }

  /**
   * Guardar estado actual en el historial
   */
  const saveToHistory = (description) => {
    if (historyComposable && !historyComposable.isUndoRedoOperation.value) {
      historyComposable.pushState(description)
    }
  }

  /**
   * Versiones con historial de las acciones principales
   */
  const actualizarElementoConHistorial = (elementoId, propiedades, description) => {
    actualizarElemento(elementoId, propiedades)

    const descripcionAuto =
      description || `Propiedades actualizadas: ${Object.keys(propiedades).join(', ')}`
    saveToHistory(descripcionAuto)
  }

  const actualizarPosicionConHistorial = (elementoId, x, y, description) => {
    actualizarPosicion(elementoId, x, y)

    // Solo guardar en historial al finalizar el arrastre, no en cada movimiento
    if (description) {
      saveToHistory(description)
    }
  }

  const seleccionarPlantaConHistorial = (plantaId) => {
    const plantaAnterior = plantaActiva.value
    seleccionarPlanta(plantaId)

    if (plantaAnterior !== plantaId) {
      const planta = plantas.value.find((p) => p.id === plantaId)
      saveToHistory(`Cambio a planta: ${planta?.nombre || plantaId}`)
    }
  }

  const agregarPlantaConHistorial = (nuevaPlanta) => {
    const id = agregarPlanta(nuevaPlanta)
    saveToHistory(`Nueva planta creada: ${nuevaPlanta.nombre || 'Sin nombre'}`)
    return id
  }

  const eliminarPlantaConHistorial = (plantaId) => {
    const planta = plantas.value.find((p) => p.id === plantaId)

    try {
      eliminarPlanta(plantaId)
      saveToHistory(`Planta eliminada: ${planta?.nombre || plantaId}`)
    } catch (error) {
      throw error // Re-lanzar error sin guardar en historial
    }
  }

  return {
    // State
    elementos,
    plantas,
    plantaActiva,
    elementoSeleccionado,
    vistaActiva,
    zoom,
    panX,
    panY,

    // Getters
    elementosVisibles,
    elementoPorId,
    plantaPorId,
    plantaActivaData,
    elementosEnPlanta,
    elementoSeleccionadoCompleto,

    // Actions - Canvas
    seleccionarElemento,
    actualizarPosicion,
    actualizarElemento,
    cambiarVista,
    configurarZoom,
    configurarPan,

    // Actions - Plantas
    seleccionarPlanta,
    agregarPlanta,
    editarPlanta,
    eliminarPlanta,

    // Actions - Elementos
    agregarElemento,
    eliminarElemento,
    toggleElementoVisibilidad,

    // === INTEGRACIÓN CON HISTORIAL ===
    initializeHistory,
    saveToHistory,

    // Actions con historial
    actualizarElementoConHistorial,
    actualizarPosicionConHistorial,
    seleccionarPlantaConHistorial,
    agregarPlantaConHistorial,
    eliminarPlantaConHistorial,
  }
})
