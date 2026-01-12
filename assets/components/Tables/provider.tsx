import React, { useEffect, useState, RefObject } from 'react'
import Table from './Table'
import type { Table as TableType } from '../../types/api'

interface PlanSize {
  width: number
  height: number
}

interface TableProviderProps {
  plan: RefObject<HTMLDivElement | null>
  load: () => void
  tables: TableType[]
}

function TableProvider({ plan, load, tables }: TableProviderProps) {
  const [planElement, setPlanElement] = useState<HTMLDivElement | null>(null)
  const [planSize, setPlanSize] = useState<PlanSize | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (plan.current !== null) {
      const planCurrent = plan.current
      setTimeout(() => {
        setPlanElement(planCurrent)
      }, 100)
    }
  }, [plan])

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
    <div className="w-full h-full">
      {!loading && planSize ? (
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
