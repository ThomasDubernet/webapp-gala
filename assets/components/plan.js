import React, { useEffect} from 'react'
// import { ContextMenu, ContextMenuTrigger, MenuItem, SubMenu } from 'react-contextmenu'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'
import Table from './Table';

const Plan = () => {
    const { items: tables, load, loading } = useGetMany('tables')

    useEffect(() => {
        load()
    }, [])

    return !loading && (
        <React.Fragment>
            <div className="plan-canvas">
                {tables.length > 0
                    ? tables.map((table, index) => (
                        <Table key={index} table={table} load={load}/>
                    ))
                    : <p>Aucune table n'a été crée.</p>
                }
            </div>
        </React.Fragment>
    )
}

class PlanElement extends HTMLElement {
    connectedCallback() {
      render(<Plan />, this)
    }
  }
  
  customElements.define('custom-plan', PlanElement)