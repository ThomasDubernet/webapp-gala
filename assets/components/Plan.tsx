import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Loader2 } from 'lucide-react'
import { useGetMany } from '../hooks'
import TableProvider from './Tables/provider'
import type { Table, Evenement } from '../types/api'

function Plan() {
  const planRef = useRef<HTMLDivElement>(null)
  const { items: tables, load, loading } = useGetMany<Table>('tables')
  const { items: events, load: loadEvents } = useGetMany<Evenement>('evenements')

  useEffect(() => {
    load()
    loadEvents()
  }, [])

  return !loading ? (
    <div className="absolute top-0 left-0 w-screen h-[calc(100vh-64px)] flex items-center justify-center">
      {events.length > 0 && events[0].plan && (
        <div id="img-box" className="relative h-full" ref={planRef}>
          <img
            src={`${events[0].plan.contentUrl}`}
            alt="plan"
            className="h-full w-auto object-contain"
          />
          <TableProvider tables={tables} plan={planRef} load={load} />
        </div>
      )}
    </div>
  ) : (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Chargement...</span>
    </div>
  )
}

class PlanElement extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this)
    root.render(<Plan />)
  }
}

customElements.define('custom-plan', PlanElement)
