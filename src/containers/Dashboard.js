import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTests.js'
import Logout from "./Logout.js"

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      if (typeof jest !== 'undefined') {
        selectCondition = bill.status === status
      } else {
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          bill.status === status &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(card).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1: return "pending"
    case 2: return "accepted"
    case 3: return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    this.bills = bills

    this.listState = {
      1: { counter: 0 },
      2: { counter: 0 },
      3: { counter: 0 }
    }

    $('#arrow-icon1').off('click').on('click', (e) => this.handleShowTickets(e, 1))
    $('#arrow-icon2').off('click').on('click', (e) => this.handleShowTickets(e, 2))
    $('#arrow-icon3').off('click').on('click', (e) => this.handleShowTickets(e, 3))

    new Logout({ localStorage, onNavigate })
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)

    $('#modaleFileAdmin1').find(".modal-body").html(`
      <div style='text-align: center;'>
        <img width=${imgWidth} src=${billUrl} alt="Bill"/>
      </div>
    `)

    $('#modaleFileAdmin1').modal('show')
  }

    handleEditTicket(e, bill, index) {
    // 👉 CAS : on clique sur la même carte → fermer
    if (this.currentOpenBillId === bill.id) {
      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon">
          ${BigBilledIcon}
        </div>
      `)

      this.currentOpenBillId = null
      return
    }

    // 👉 Sinon : ouvrir la nouvelle carte
    this.currentOpenBillId = bill.id

    // Reset background de toutes les cartes
    this.bills.forEach(b => {
      $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
    })

    // Highlight carte active
    $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })

    // Affichage du formulaire
    $('.dashboard-right-container div').html(DashboardFormUI(bill))
    $('.vertical-navbar').css({ height: '150vh' })

    $('#icon-eye-d').off('click').on('click', this.handleClickIconEye)
    $('#btn-accept-bill').off('click').on('click', () => this.handleAcceptSubmit(bill))
    $('#btn-refuse-bill').off('click').on('click', () => this.handleRefuseSubmit(bill))
  }


  handleShowTickets(e, index) {
    const state = this.listState[index]
    const status = getStatus(index)
    const billsForStatus = filteredBills(this.bills, status)

    if (state.counter % 2 === 0) {
      $(`#arrow-icon${index}`).css({ transform: 'rotate(0deg)' })
      $(`#status-bills-container${index}`).html(cards(billsForStatus))
    } else {
      $(`#arrow-icon${index}`).css({ transform: 'rotate(90deg)' })
      $(`#status-bills-container${index}`).html("")
    }

    state.counter++

    billsForStatus.forEach(bill => {
      $(`#open-bill${bill.id}`).off('click').on('click', (e) =>
        this.handleEditTicket(e, bill, index)
      )
    })
  }

  handleAcceptSubmit = async (bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }

    await this.updateBill(newBill)
    //Refraichir les bills directement du store
    this.bills = await this.getBillsAllUsers()
    this.onNavigate(ROUTES_PATH.Dashboard)
  }

  handleRefuseSubmit = async (bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }

    await this.updateBill(newBill)
    this.bills = await this.getBillsAllUsers()
    this.onNavigate(ROUTES_PATH.Dashboard)
  }


  getBillsAllUsers = () => {
  if (!this.store) return []

  return this.store
    .bills()
    .list()
    .then(snapshot =>
      snapshot
        .map(doc => ({
          id: doc.id,
          ...doc
        }))
        .sort((a, b) => {
          const dateA = Date.parse(a.date)
          const dateB = Date.parse(b.date)

          // Dates invalides à la fin
          if (isNaN(dateA)) return 1
          if (isNaN(dateB)) return -1

          // Plus récent → plus ancien
          return dateB - dateA
        })
    )
}


  updateBill = (bill) => {
    if (!this.store) return

    return this.store
      .bills()
      .update({
        data: JSON.stringify(bill),
        selector: bill.id
      })
  }
}
