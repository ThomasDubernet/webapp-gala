import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'

const ContextMenuTable = ({table}) => {

    return (
        <div>Menu</div>
    )
}

const Table = ({table}) => {
    const [open, setOpen] = useState(false)
    const {
        id,
        nom,
        nombrePlacesMax: nbMax,
        numero,
        categorie: {
            id: idCat,
            couleur,
            nom: nomCat
        },
        personnes
    } = table
    
    return (
        <React.Fragment>
            <div
                className="custom-table"
                style={{background: couleur}}
                onContextMenu={() => setOpen(true)}
                onClick={() => console.log('left click')}
            >
                <p className="number">N°{numero}</p>
                <p className="number-max">
                {personnes.length} / {nbMax}
                </p>
            </div>

            {open && <ContextMenuTable table={table} />}
        </React.Fragment>
    )
}

const Plan = () => {
    const { items: tables, load, loading } = useGetMany('tables')

    useEffect(() => {
        load()
    }, [])

    return !loading && (
        <React.Fragment>
            <div className="d-flex">
                {tables.length > 0
                    ? tables.map((table, index) => (
                        <Table key={index} table={table} />
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