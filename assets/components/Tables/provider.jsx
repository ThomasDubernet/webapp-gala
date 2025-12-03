/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react'
import { useGetMany } from '../../hooks'
import Table from './Table'

function TableProvider(props) {
  const { plan, load, tables } = props
  const [planElement, setPlanElement] = useState(null)
  const [planSize, setPlanSize] = useState(null)
  const [loading, setLoading] = useState(true)
  const { items: fetchedPersonnes, load: loadPersonnes } = useGetMany(
    `personnes?exists[table]=false`
  )

  // État local pour gérer la liste des personnes non affectées
  const [allPersonnes, setAllPersonnes] = useState([])

  useEffect(() => {
    loadPersonnes()
  }, [])

  // Synchroniser les données fetchées vers l'état local avec fullname
  useEffect(() => {
    const personnesWithFullname = fetchedPersonnes.map((item) => ({
      ...item,
      fullname: `${item.prenom} ${item.nom}`
    }))
    setAllPersonnes(personnesWithFullname)
  }, [fetchedPersonnes])

  // Callback pour retirer une personne de la liste après ajout réussi
  const handlePersonneAdded = useCallback((personneId) => {
    setAllPersonnes((prev) => prev.filter((p) => p.id !== personneId))
  }, [])

  useEffect(() => {
    if (plan.current !== null) {
      const planCurrent = plan.current
      setTimeout(() => {
        setPlanElement(planCurrent)
      }, 100)
    }
  }, [props])

  useEffect(() => {
    if (
      planElement !== null &&
      planElement.clientWidt !== 0 &&
      planElement.clientHeight !== 0
    ) {
      setPlanSize({
        width: planElement.clientWidth,
        height: planElement.clientHeight,
      })
      setLoading(false)
    }
  }, [planElement])
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {!loading ? (
        tables.length > 0 ? (
          tables.map((table) => (
            <Table
              key={table.id}
              table={table}
              load={load}
              planSize={planSize}
              planRef={plan}
              allPersonnes={allPersonnes}
              onPersonneAdded={handlePersonneAdded}
            />
          ))
        ) : (
          <p>Aucune table n'a été créé.</p>
        )
      ) : null}
    </div>
  )
}

export default TableProvider
