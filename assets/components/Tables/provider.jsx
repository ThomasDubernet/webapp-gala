import React, { useEffect, useState } from 'react'
import Table from './Table'

function TableProvider(props) {
  const { plan, load, tables } = props
  const [planElement, setPlanElement] = useState(null)
  const [planSize, setPlanSize] = useState(null)
  const [loading, setLoading] = useState(true)

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
      planElement.clientWidth !== 0 &&
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
            />
          ))
        ) : (
          <p>Aucune table n&apos;a été créée.</p>
        )
      ) : null}
    </div>
  )
}

export default TableProvider
