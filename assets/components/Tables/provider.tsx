import React, { useEffect, useState, useRef, useCallback, RefObject } from 'react'
import Table from './Table'
import type { Table as TableType } from '../../types/api'

interface PlanSize {
  width: number
  height: number
}

interface TableProviderProps {
  plan: RefObject<HTMLDivElement | null>
  container?: RefObject<HTMLDivElement | null>
  load: () => void
  tables: TableType[]
}

function TableProvider({ plan, container, load, tables }: TableProviderProps) {
  const [planSize, setPlanSize] = useState<PlanSize | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to update plan size
  const updatePlanSize = useCallback(() => {
    if (plan.current && plan.current.clientWidth !== 0 && plan.current.clientHeight !== 0) {
      setPlanSize({
        width: plan.current.clientWidth,
        height: plan.current.clientHeight,
      })
      setLoading(false)
    }
  }, [plan])

  // Initial size calculation with a small delay to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePlanSize()
    }, 100)

    return () => clearTimeout(timer)
  }, [updatePlanSize])

  // ResizeObserver to detect container/plan size changes (e.g., sidebar collapse)
  useEffect(() => {
    const elementToObserve = container?.current || plan.current
    if (!elementToObserve) return

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const resizeObserver = new ResizeObserver(() => {
      // Debounce with a delay longer than the sidebar animation (200ms)
      // to ensure we capture the final size after transitions complete
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        updatePlanSize()
      }, 250)
    })

    resizeObserver.observe(elementToObserve)

    // Also observe the plan element if container is different
    if (container?.current && plan.current && container.current !== plan.current) {
      resizeObserver.observe(plan.current)
    }

    return () => {
      resizeObserver.disconnect()
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [container, plan, updatePlanSize])

  if (loading || !planSize) {
    return null
  }

  return (
    <>
      {tables.map((table) => (
        <Table
          key={table.id}
          table={table}
          load={load}
          planSize={planSize}
          planRef={plan}
        />
      ))}
    </>
  )
}

export default TableProvider
