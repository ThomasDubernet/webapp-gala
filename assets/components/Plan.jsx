import React, { useEffect, useRef } from 'react'
import { render } from 'react-dom'
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
          <TableProvider tables={tables} plan={planRef} />
        </div>
      )}
    </div>
  ) : (
    <p className="loading">Chargement...</p>
  )
}

class PlanElement extends HTMLElement {
  connectedCallback() {
    render(<Plan />, this)
  }
}

customElements.define('custom-plan', PlanElement)
