import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
}

/**
 * Parse une date en timestamp (ms). Gère quelques formats courants.
 * Retourne 0 si parsing impossible (pousse la date en fin de liste).
 */
const parseToTimestamp = (dateStr) => {
  if (!dateStr) return 0

  // tentative directe (ISO, YYYY-MM-DD, etc.)
  let ts = Date.parse(dateStr)
  if (!Number.isNaN(ts)) return ts

  // essayer DD/MM/YYYY ou DD.MM.YYYY ou DD-MM-YYYY
  const parts = dateStr.split(/[\/\.\-]/)
  if (parts.length === 3) {
    // si premier élément est l'année (YYYY) -> ISO probable
    if (parts[0].length === 4) {
      const iso = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
      ts = Date.parse(iso)
      if (!Number.isNaN(ts)) return ts
    } else {
      // DD/MM/YYYY -> YYYY-MM-DD
      const iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      ts = Date.parse(iso)
      if (!Number.isNaN(ts)) return ts
    }
  }

  // fallback
  return 0
}

const rows = (data) => {
  if (!data || !data.length) return ""

  // clonage pour ne pas muter l'original
  const sorted = [...data].sort((a, b) => {
    const ta = parseToTimestamp(a.date)
    const tb = parseToTimestamp(b.date)
    // tri antichrono : plus récentes d'abord
    return tb - ta
    // tri chrono: plus ancienns d'abord
    // return ta - tb;
  })

  return sorted.map(bill => row(bill)).join("")
}

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`)
}
