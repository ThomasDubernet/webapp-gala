/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react'
import { useGetMany } from '../../hooks'
import Table from './Table'

function TableProvider(props) {
  const { plan, load, tables } = props
  const [planElement, setPlanElement] = useState(null)
  const [planSize, setPlanSize] = useState(null)
  const [loading, setLoading] = useState(true)
  const { items: allPersonnes, load: loadPersonnes } = useGetMany(
    `personnes?exists[table]=false`
  )

  useEffect(() => {
    loadPersonnes()
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
    allPersonnes.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.fullname = `${item.prenom} ${item.nom}`
    })
  }, [allPersonnes])

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
