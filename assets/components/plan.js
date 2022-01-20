import React, { useEffect, useRef} from 'react'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'
import TableProvider from './Tables/provider';
import Table from './Tables/Table';

const Plan = () => {
    const { items: tables, load, loading } = useGetMany('tables')
    const { items: events, load: loadEvents } = useGetMany('evenements')

    useEffect(() => {
        load()
        loadEvents()
    }, [])

    return !loading ? (
        <React.Fragment>
            <div className="plan-canvas">
                {events.length > 0 && 
                <div id="img-box" className="img-box">
                    <img src={`${events[0].plan.contentUrl}`} alt="plan-image" />
                    <TableProvider tables={tables} plan={planRef} />
                    {/* {tables.length > 0
                        ? tables.map((table, index) => (
                            <Table key={index} table={table} load={load} />
                        ))
                        : <p>Aucune table n'a été créée.</p>
                    } */}
                </div>
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