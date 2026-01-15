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

// Hook to detect mobile devices
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Check both screen size and touch capability
      const isMobileSize = window.innerWidth < 768
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsMobile(isMobileSize && hasTouch)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

function TableProvider({ plan, container, load, tables }: TableProviderProps) {
  const [planSize, setPlanSize] = useState<PlanSize | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const isMobile = useIsMobile()

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

  // Handle selection - click anywhere on plan background to deselect
  const handlePlanClick = useCallback((e: React.MouseEvent) => {
    // Deselect if clicking on the wrapper div (not on a table)
    // Tables stop propagation via their own onClick
    if (e.currentTarget === e.target) {
      setSelectedTableId(null)
    }
  }, [])

  // Handle table selection
  const handleSelectTable = useCallback((id: number) => {
    setSelectedTableId(prevId => prevId === id ? null : id)
  }, [])

  if (loading || !planSize) {
    return null
  }

  return (
    <div onClick={handlePlanClick} style={{ position: 'absolute', inset: 0 }}>
      {tables.map((table) => (
        <Table
          key={table.id}
          table={table}
          load={load}
          planSize={planSize}
          planRef={plan}
          isSelected={selectedTableId === table.id}
          onSelect={handleSelectTable}
          editable={!isMobile}
        />
      ))}
    </div>
  )
}

export default TableProvider
