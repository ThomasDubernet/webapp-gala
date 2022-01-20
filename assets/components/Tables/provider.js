import React, { useEffect } from 'react'
import { useState } from 'react'
import Table from './Table'

const TableProvider = (props) => {
    const [planElement, setPlanElement] = useState(null)
    const [planSize, setPlanSize] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if(props.plan.current !== null) {
            const plan = props.plan.current
            setTimeout(() => {
                setPlanElement(plan)
            }, 100)
        }
    }, [props])
    useEffect(() => {
        if(planElement !== null && (planElement.clientWidt !== 0 && planElement.clientHeight !== 0)) {
            setPlanSize({width: planElement.clientWidth, height: planElement.clientHeight})
            setLoading(false)
        }
    }, [planElement])
    return(
        <div style={{width: "100%", height: "100%"}}>
            {!loading ? (
                props.tables.length > 0 ? (
                    props.tables.map((table, index) => (
                        <Table key={index} table={table} load={props.load} planSize={planSize} planRef={props.plan}/>
                    ))
                ) : (
                    <p>Aucune table n'a été créé.</p>
                )
            ) : null}
        </div>
    )
}

export default TableProvider