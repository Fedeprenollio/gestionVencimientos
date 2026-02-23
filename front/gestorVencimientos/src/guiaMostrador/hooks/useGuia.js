import { useState } from "react"
import { guiaData } from "../data/guia"

export const useGuia = () => {
  const [query, setQuery] = useState("")
  const [sintomaActivo, setSintomaActivo] = useState(null)

  const buscar = () => {
    if (!query) return []

    const q = query.toLowerCase()

    return guiaData.sistemas.flatMap(sistema =>
      sistema.sintomas.filter(s =>
        s.nombre.toLowerCase().includes(q) ||
        s.keywords?.some(k => k.toLowerCase().includes(q))
      )
    )
  }

  return {
    sistemas: guiaData.sistemas,
    query,
    setQuery,
    buscar,
    sintomaActivo,
    setSintomaActivo
  }
}