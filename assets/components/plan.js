import React from 'react'
import { render } from 'react-dom'

class PlanElement extends HTMLElement {
    connectedCallback() {
      render(<div>Test PLAN</div>, this)
    }
  }
  
  customElements.define('custom-plan', PlanElement)