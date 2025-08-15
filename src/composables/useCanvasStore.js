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
      dimensiones: {
        alto: 300, // cm
        ancho: 1000, // cm
        largo: 1200, // cm
      },
      pesoMaximoSoportado: 5000, // kg
    },
    {
      id: 'planta_2',
      nombre: 'Primer Piso',
      descripcion: 'Segundo nivel del edificio',
      elementos: ['elem_3'],
      activa: false,
      dimensiones: {
        alto: 280,
        ancho: 1000,
        largo: 1200,
      },
      pesoMaximoSoportado: 4500,
    },
    {
      id: 'planta_3',
      nombre: 'Segundo Piso',
      descripcion: 'Tercer nivel del edificio',
      elementos: [],
      activa: false,
      dimensiones: {
        alto: 280,
        ancho: 800,
        largo: 1000,
      },
      pesoMaximoSoportado: 4000,
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

  // === NAVEGACIÓN JERÁRQUICA ===
  // Contexto de navegación: representa la "ubicación" actual en la jerarquía
  const contextoNavegacion = ref({
    tipo: 'planta', // 'planta' | 'elemento'
    id: 'planta_1', // ID de la planta o elemento actual
    path: [], // Array de objetos: [{ tipo: 'planta', id: 'planta_1', nombre: 'Planta Baja' }]
  })

  // Tamaño del canvas adaptativo según el contexto
  const canvasAdaptativo = ref({
    width: 800,
    height: 600,
    escala: 1,
  })

  // Getters
  const elementosVisibles = computed(() => {
    // Si estamos en una planta, mostrar solo elementos de nivel raíz (sin padre)
    if (contextoNavegacion.value.tipo === 'planta') {
      const visibles = elementos.value.filter(
        (el) => el.plantaId === contextoNavegacion.value.id && !el.padre,
      )
      console.log('Elementos visibles en planta (solo raíz):', {
        plantaId: contextoNavegacion.value.id,
        elementosRaiz: visibles.length,
        elementos: visibles,
      })
      return visibles
    }

    // Si estamos dentro de un elemento, mostrar sus hijos
    if (contextoNavegacion.value.tipo === 'elemento') {
      const elementoPadre = elementos.value.find((el) => el.id === contextoNavegacion.value.id)
      if (elementoPadre && elementoPadre.hijos) {
        const hijosCompletos = elementoPadre.hijos
          .map((hijoId) => elementos.value.find((el) => el.id === hijoId))
          .filter(Boolean)

        console.log('Elementos visibles en contenedor:', {
          contenedorId: contextoNavegacion.value.id,
          hijosVisibles: hijosCompletos.length,
          hijos: hijosCompletos,
        })
        return hijosCompletos
      }
    }

    return []
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

  // === COMPUTED PARA NAVEGACIÓN JERÁRQUICA ===
  const contextoActual = computed(() => {
    return contextoNavegacion.value
  })

  const estaEnPlanta = computed(() => {
    return contextoNavegacion.value.tipo === 'planta'
  })

  const estaEnElemento = computed(() => {
    return contextoNavegacion.value.tipo === 'elemento'
  })

  const elementoContenedorActual = computed(() => {
    if (contextoNavegacion.value.tipo === 'elemento') {
      return elementos.value.find((el) => el.id === contextoNavegacion.value.id)
    }
    return null
  })

  const breadcrumbs = computed(() => {
    const crumbs = []

    // Siempre empezamos con la planta
    const planta = plantaPorId.value(contextoNavegacion.value.path[0]?.id || plantaActiva.value)
    if (planta) {
      crumbs.push({
        tipo: 'planta',
        id: planta.id,
        nombre: planta.nombre,
        icono: '🏢',
      })
    }

    // Agregar elementos del path
    for (let i = 1; i < contextoNavegacion.value.path.length; i++) {
      const pathItem = contextoNavegacion.value.path[i]
      if (pathItem.tipo === 'elemento') {
        const elemento = elementoPorId.value(pathItem.id)
        if (elemento) {
          crumbs.push({
            tipo: 'elemento',
            id: elemento.id,
            nombre: elemento.nombre,
            icono: getIconoElemento(elemento.tipo),
          })
        }
      }
    }

    return crumbs
  })

  const puedeNavegar = computed(() => {
    return contextoNavegacion.value.path.length > 1
  })

  // Helper function para iconos
  const getIconoElemento = (tipo) => {
    const iconos = {
      anaqueles: '📚',
      estantes: '📋',
      mesas: '🗄️',
      armarios: '🗃️',
      contenedores: '📦',
      cajas: '📦',
    }
    return iconos[tipo] || '📦'
  }

  // === FUNCIONES DE NAVEGACIÓN JERÁRQUICA ===
  const navegarAElemento = (elementoId) => {
    const elemento = elementoPorId.value(elementoId)
    if (!elemento) {
      console.error('Elemento no encontrado:', elementoId)
      return
    }

    // Actualizar contexto de navegación
    const nuevoPath = [...contextoNavegacion.value.path]
    nuevoPath.push({
      tipo: 'elemento',
      id: elementoId,
      nombre: elemento.nombre,
    })

    contextoNavegacion.value = {
      tipo: 'elemento',
      id: elementoId,
      path: nuevoPath,
    }

    // Calcular tamaño del canvas según el elemento
    calcularCanvasAdaptativo(elemento)

    // Reset zoom y pan
    zoom.value = 1
    panX.value = 0
    panY.value = 0

    // Deseleccionar elemento actual
    elementoSeleccionado.value = null

    console.log('Navegando a elemento:', {
      elementoId,
      nombre: elemento.nombre,
      path: nuevoPath,
    })

    // Guardar en historial
    saveToHistory(`Navegación a ${elemento.nombre}`)
  }

  const navegarAlPadre = () => {
    if (contextoNavegacion.value.path.length <= 1) {
      console.warn('Ya estás en el nivel raíz')
      return
    }

    // Remover último elemento del path
    const nuevoPath = [...contextoNavegacion.value.path]
    nuevoPath.pop()

    const ultimoElemento = nuevoPath[nuevoPath.length - 1]

    if (ultimoElemento.tipo === 'planta') {
      // Regresar a vista de planta
      contextoNavegacion.value = {
        tipo: 'planta',
        id: ultimoElemento.id,
        path: nuevoPath,
      }

      // Reset canvas a tamaño por defecto
      canvasAdaptativo.value = {
        width: 800,
        height: 600,
        escala: 1,
      }
    } else {
      // Regresar a elemento padre
      contextoNavegacion.value = {
        tipo: 'elemento',
        id: ultimoElemento.id,
        path: nuevoPath,
      }

      const elementoPadre = elementoPorId.value(ultimoElemento.id)
      if (elementoPadre) {
        calcularCanvasAdaptativo(elementoPadre)
      }
    }

    // Reset zoom y pan
    zoom.value = 1
    panX.value = 0
    panY.value = 0

    // Deseleccionar elemento actual
    elementoSeleccionado.value = null

    console.log('Navegando al padre:', {
      nuevoContexto: contextoNavegacion.value,
      path: nuevoPath,
    })

    // Guardar en historial
    saveToHistory(`Navegación al padre`)
  }

  const navegarAPlanta = (plantaId) => {
    const planta = plantaPorId.value(plantaId)
    if (!planta) {
      console.error('Planta no encontrada:', plantaId)
      return
    }

    // Reset a vista de planta
    contextoNavegacion.value = {
      tipo: 'planta',
      id: plantaId,
      path: [
        {
          tipo: 'planta',
          id: plantaId,
          nombre: planta.nombre,
        },
      ],
    }

    // Actualizar planta activa
    plantaActiva.value = plantaId

    // Reset canvas a tamaño por defecto
    canvasAdaptativo.value = {
      width: 800,
      height: 600,
      escala: 1,
    }

    // Reset zoom y pan
    zoom.value = 1
    panX.value = 0
    panY.value = 0

    // Deseleccionar elemento actual
    elementoSeleccionado.value = null

    console.log('Navegando a planta:', {
      plantaId,
      nombre: planta.nombre,
    })

    // Guardar en historial
    saveToHistory(`Navegación a ${planta.nombre}`)
  }

  const calcularCanvasAdaptativo = (elemento) => {
    // Calcular tamaño proporcional del canvas basado en las dimensiones del elemento
    const factorEscala = 10 // Factor para hacer el canvas más grande que el elemento

    canvasAdaptativo.value = {
      width: Math.max(elemento.width * factorEscala, 400), // Mínimo 400px
      height: Math.max(elemento.height * factorEscala, 300), // Mínimo 300px
      escala: factorEscala,
    }

    console.log('Canvas adaptativo calculado:', {
      elemento: { width: elemento.width, height: elemento.height },
      canvas: canvasAdaptativo.value,
    })
  }

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

    // Actualizar contexto de navegación
    const planta = plantaPorId.value(plantaId)
    if (planta) {
      contextoNavegacion.value = {
        tipo: 'planta',
        id: plantaId,
        path: [
          {
            tipo: 'planta',
            id: plantaId,
            nombre: planta.nombre,
          },
        ],
      }
    }
  }

  const agregarPlanta = (nuevaPlanta) => {
    const id = `planta_${Date.now()}`
    plantas.value.push({
      id,
      nombre: nuevaPlanta.nombre || 'Nueva Planta',
      descripcion: nuevaPlanta.descripcion || '',
      elementos: [],
      activa: false,
      dimensiones: {
        alto: nuevaPlanta.dimensiones?.alto || 280,
        ancho: nuevaPlanta.dimensiones?.ancho || 800,
        largo: nuevaPlanta.dimensiones?.largo || 1000,
      },
      pesoMaximoSoportado: nuevaPlanta.pesoMaximoSoportado || 3000,
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

    // Si estamos dentro de un elemento (no en una planta), el nuevo elemento es hijo
    if (contextoNavegacion.value.tipo === 'elemento') {
      const elementoPadre = elementos.value.find((el) => el.id === contextoNavegacion.value.id)
      if (elementoPadre) {
        // Agregar como hijo del elemento actual
        nuevoElemento.padre = elementoPadre.id
        nuevoElemento.plantaId = elementoPadre.plantaId // Hereda la planta del padre

        // Agregar el ID del hijo al array de hijos del padre
        if (!elementoPadre.hijos) {
          elementoPadre.hijos = []
        }
        elementoPadre.hijos.push(nuevoElemento.id)

        console.log('Elemento agregado como hijo de:', {
          padre: elementoPadre.nombre,
          hijo: nuevoElemento.nombre,
          hijosDelPadre: elementoPadre.hijos.length,
        })
      }
    } else {
      // Si estamos en una planta, agregar normalmente
      nuevoElemento.plantaId = contextoNavegacion.value.id
      nuevoElemento.padre = null
    }

    elementos.value.push(nuevoElemento)
    console.log('Total elementos en store:', elementos.value.length)
    console.log('Elementos visibles:', elementosVisibles.value.length)

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

    // Navegación jerárquica - Getters
    contextoActual,
    estaEnPlanta,
    estaEnElemento,
    elementoContenedorActual,
    breadcrumbs,
    puedeNavegar,
    contextoNavegacion,
    canvasAdaptativo,

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

    // Navegación jerárquica - Actions
    navegarAElemento,
    navegarAlPadre,
    navegarAPlanta,
    calcularCanvasAdaptativo,

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
