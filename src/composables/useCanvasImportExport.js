/**
 * useCanvasImportExport.js
 *
 * Composable para funcionalidades de importación y exportación del canvas.
 * Proporciona métodos para guardar y cargar el estado completo del canvas.
 */

import { useCanvasStore } from './useCanvasStore'

export const useCanvasImportExport = () => {
  const canvasStore = useCanvasStore()

  /**
   * Exporta el estado actual del canvas a un archivo JSON
   * @param {string} nombreArchivo - Nombre del archivo (opcional)
   */
  const exportarCanvas = (nombreArchivo = null) => {
    try {
      // Serializar el estado
      const jsonData = canvasStore.serialize()

      // Generar nombre de archivo si no se proporciona
      const fecha = new Date().toISOString().split('T')[0]
      const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
      const filename = nombreArchivo || `canvas-export-${fecha}-${hora}.json`

      // Crear blob y descargar
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      console.log('Canvas exportado exitosamente:', filename)
      return true
    } catch (error) {
      console.error('Error al exportar canvas:', error)
      return false
    }
  }

  /**
   * Importa el estado del canvas desde un archivo JSON
   * @param {File} archivo - Archivo JSON a importar
   * @returns {Promise<boolean>} true si la importación fue exitosa
   */
  const importarCanvas = (archivo) => {
    return new Promise((resolve, reject) => {
      if (!archivo) {
        reject(new Error('No se proporcionó archivo'))
        return
      }

      if (!archivo.name.endsWith('.json')) {
        reject(new Error('El archivo debe ser un JSON'))
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const jsonString = e.target.result
          const exito = canvasStore.deserialize(jsonString)

          if (exito) {
            // Asegurar navegación correcta después de importar
            const plantaActiva = canvasStore.plantaActiva
            if (plantaActiva) {
              canvasStore.navegarAPlanta(plantaActiva)
            }

            console.log('Canvas importado exitosamente desde:', archivo.name)
            resolve(true)
          } else {
            reject(new Error('Error al deserializar el archivo JSON'))
          }
        } catch (error) {
          reject(new Error(`Error al leer el archivo: ${error.message}`))
        }
      }

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }

      reader.readAsText(archivo)
    })
  }

  /**
   * Exporta solo las plantas sin elementos
   * @param {string} nombreArchivo - Nombre del archivo (opcional)
   */
  const exportarPlantas = (nombreArchivo = null) => {
    try {
      const plantasData = {
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          tipo: 'plantas-only',
          app: 'dv-canva-editor',
        },
        plantas: canvasStore.plantas.map((planta) => ({
          id: planta.id,
          nombre: planta.nombre,
          descripcion: planta.descripcion || '',
          dimensiones: {
            alto: planta.dimensiones?.alto || 280,
            ancho: planta.dimensiones?.ancho || 800,
            largo: planta.dimensiones?.largo || 1000,
          },
          pesoMaximoSoportado: planta.pesoMaximoSoportado || 3000,
          propiedadesPersonalizadas: planta.propiedadesPersonalizadas || {},
        })),
      }

      const jsonData = JSON.stringify(plantasData, null, 2)

      // Generar nombre de archivo
      const fecha = new Date().toISOString().split('T')[0]
      const filename = nombreArchivo || `plantas-${fecha}.json`

      // Crear blob y descargar
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      console.log('Plantas exportadas exitosamente:', filename)
      return true
    } catch (error) {
      console.error('Error al exportar plantas:', error)
      return false
    }
  }

  /**
   * Copia el estado serializado al portapapeles
   */
  const copiarAlPortapapeles = async () => {
    try {
      const jsonData = canvasStore.serialize()
      await navigator.clipboard.writeText(jsonData)
      console.log('Estado copiado al portapapeles')
      return true
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error)
      return false
    }
  }

  /**
   * Pega y deserializa desde el portapapeles
   */
  const pegarDesdePortapapeles = async () => {
    try {
      const jsonString = await navigator.clipboard.readText()
      const exito = canvasStore.deserialize(jsonString)

      if (exito) {
        console.log('Estado pegado desde portapapeles')
        return true
      } else {
        throw new Error('JSON inválido en el portapapeles')
      }
    } catch (error) {
      console.error('Error al pegar desde portapapeles:', error)
      return false
    }
  }

  /**
   * Valida si un JSON tiene la estructura correcta para importar
   * @param {string} jsonString - String JSON a validar
   * @returns {object} Resultado de la validación
   */
  const validarJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString)

      const esCompleto = !!(data.plantas && data.elementos && data.configuracion)
      const esSoloPlantas = !!(data.plantas && data.meta?.tipo === 'plantas-only')
      const tieneVersion = !!data.meta?.version

      return {
        valido: esCompleto || esSoloPlantas,
        tipo: esCompleto ? 'completo' : esSoloPlantas ? 'plantas' : 'desconocido',
        version: data.meta?.version || 'desconocida',
        plantas: data.plantas?.length || 0,
        elementos: data.elementos?.length || 0,
        fecha: data.meta?.timestamp || null,
      }
    } catch (error) {
      return {
        valido: false,
        error: error.message,
      }
    }
  }

  return {
    // Funciones principales
    exportarCanvas,
    importarCanvas,
    exportarPlantas,

    // Funciones de portapapeles
    copiarAlPortapapeles,
    pegarDesdePortapapeles,

    // Utilidades
    validarJSON,

    // Acceso directo a las funciones del store
    serialize: canvasStore.serialize,
    deserialize: canvasStore.deserialize,
  }
}
