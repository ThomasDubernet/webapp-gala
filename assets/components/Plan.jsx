import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { useGetMany } from '../hooks'
import TableProvider from './Tables/provider'

function Plan() {
  const planRef = useRef(null)
  const { items: tables, load, loading } = useGetMany('tables')
  const { items: events, load: loadEvents } = useGetMany('evenements')

  useEffect(() => {
    load()
    loadEvents()
  }, [])

  return !loading ? (
    <div className="plan-canvas">
      {events.length > 0 && (
        <div id="img-box" className="img-box" ref={planRef}>
          <img src={`${events[0].plan.contentUrl}`} alt="plan" />
          <TableProvider tables={tables} plan={planRef} load={load} />
        </div>
      )}
    </div>
  ) : (
    <p className="loading">Chargement...</p>
  )
}

class PlanElement extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this)
    root.render(<Plan />)
  }
}

customElements.define('custom-plan', PlanElement)
