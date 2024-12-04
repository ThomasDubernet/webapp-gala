/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.scss'

// start the Stimulus application
import './bootstrap'

// eslint-disable-next-line no-unused-vars
import { Popover, Toast, Tooltip } from 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'

import './components/Search'
import './components/Plan'
import './components/HotesseSearch'

// Keep log for don't remove import
console.log({ Tooltip, Toast, Popover })

const syncBilletWebData = async () => {
  const popup = document.getElementById('billet_web_sync_popup')
  popup.classList.add('show')

  try {
    const response = await fetch('/api/billet-web/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 200) {
      const data = await response.json()
      // eslint-disable-next-line no-console
      console.log(data)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  } finally {
    popup.classList.remove('show')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formImport = document.getElementById('form_import')
  const inputImport = document.getElementById('import_importFile')

  if (inputImport) {
    inputImport.addEventListener('change', (e) => {
      e.preventDefault()
      formImport.submit()
    })
  }

  const syncBtn = document.getElementById('billet_web_sync_btn')

  if (syncBtn) {
    syncBtn.addEventListener('click', (e) => {
      console.log('click')
      e.preventDefault()
      syncBilletWebData()
    })
  }
})
