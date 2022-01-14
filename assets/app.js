/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.scss';

// start the Stimulus application
import './bootstrap';

import { Tooltip, Toast, Popover } from 'bootstrap'

import "bootstrap-icons/font/bootstrap-icons.css";

import "./components/search.js"
import "./components/plan.js"
import "./components/hotesseSearch.js"

document.addEventListener('DOMContentLoaded', () => {
    
    const formImport = document.getElementById('form_import')
    const inputImport = document.getElementById('import_importFile')

    if (inputImport) {
        inputImport.addEventListener('change', (e) => {
            e.preventDefault()
            formImport.submit()
        })
    }

})
