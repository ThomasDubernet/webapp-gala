/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/tailwind.css'

import './components/Search'
import './components/Plan'
import './components/HotesseSearch'

const syncBilletWebData = async () => {
  const popup = document.getElementById('billet_web_sync_popup')
  popup.classList.remove('hidden')

  try {
    const response = await fetch('/api/billet-web/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 200) {
      await response.json()
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  } finally {
    popup.classList.add('hidden')
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
      e.preventDefault()
      syncBilletWebData()
    })
  }
})
