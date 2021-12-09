import React, { useEffect} from 'react'
// import { ContextMenu, ContextMenuTrigger, MenuItem, SubMenu } from 'react-contextmenu'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'
import Table from './Table';

const Plan = () => {
    const { items: tables, load, loading } = useGetMany('tables')
    const { items: events, load: loadEvents } = useGetMany('evenements')

    useEffect(() => {
        load()
        loadEvents()
    }, [])

    return !loading ? (
        <React.Fragment>
            <div className="plan-canvas" style={events.length > 0 ? {
                backgroundImage: `url('${events[0].plan.contentUrl}')`
            } : null}>
                {tables.length > 0
                    ? tables.map((table, index) => (
                        <Table key={index} table={table} load={load}/>
                    ))
                    : <p>Aucune table n'a été crée.</p>
                }
            </div>
        </React.Fragment>
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