/**
 * @jest-environment jsdom
 */

// Helpers Testing Library
import { screen } from "@testing-library/dom"

// Vue du formulaire Dashboard
import DashboardFormUI from "../views/DashboardFormUI.js"

// Helper de formatage
import { formatDate } from "../app/format.js"


/**
 * ===============================
 * FIXTURES – Bill de référence
 * ===============================
 */

// Bill complet valide
const bill = {
  id: "47qAXb6fIm2zOKkLzMro",
  vat: "80",
  fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  status: "accepted",
  type: "Hôtel et logement",
  commentAdmin: "ok",
  commentary: "séminaire billed",
  name: "encore",
  fileName: "preview-facture-free-201801-pdf-1.jpg",
  date: "2004-04-04",
  amount: 400,
  email: "a@a",
  pct: 20
}

// Variantes selon statut
const billAccepted = {
  ...bill,
  status: "accepted"
}

const billPending = {
  ...bill,
  status: "pending"
}

const billrefused = {
  ...bill,
  status: "refused"
}


/**
 * ===============================
 * TESTS – DashboardFormUI
 * ===============================
 */

describe('Given I am connected as an Admin and I am on Dashboard Page', () => {

  /**
   * --------------------------------
   * Rendu avec bill complet
   * --------------------------------
   */
  describe('When bill data is passed to DashboardUI', () => {

    test('Then, it should display bill information in the page', () => {

      const html = DashboardFormUI(bill)
      document.body.innerHTML = html

      // Vérifie affichage des champs principaux
      expect(screen.getByText(bill.vat)).toBeTruthy()
      expect(screen.getByText(bill.type)).toBeTruthy()
      expect(screen.getByText(bill.commentary)).toBeTruthy()
      expect(screen.getByText(bill.name)).toBeTruthy()
      expect(screen.getByText(bill.fileName)).toBeTruthy()

      // Vérifie date formatée
      expect(screen.getByText(formatDate(bill.date))).toBeTruthy()

      // Vérifie montants numériques
      expect(screen.getByText(bill.amount.toString())).toBeTruthy()
      expect(screen.getByText(bill.pct.toString())).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Bill en attente (pending)
   * --------------------------------
   */
  describe('When pending bill is passed to DashboardUI', () => {

    test('Then, it should show buttons and textarea', () => {

      const html = DashboardFormUI(billPending)
      document.body.innerHTML = html

      // Boutons d’action admin
      expect(screen.getByText("Accepter")).toBeTruthy()
      expect(screen.getByText("Refuser")).toBeTruthy()

      // Zone de commentaire admin
      expect(screen.getByTestId("commentary2")).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Bill accepté
   * --------------------------------
   */
  describe('When accepted bill is passed to DashboardUI', () => {

    test('Then, it should show admin commentary', () => {

      const html = DashboardFormUI(billAccepted)
      document.body.innerHTML = html

      // Vérifie affichage commentaire admin
      expect(screen.getByText(bill.commentAdmin)).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Bill refusé
   * --------------------------------
   */
  describe('When refused bill is passed to DashboardUI', () => {

    test('Then, it should show admin commentary', () => {

      const html = DashboardFormUI(billrefused)
      document.body.innerHTML = html

      // Vérifie affichage commentaire admin
      expect(screen.getByText(bill.commentAdmin)).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Champs optionnels manquants
   * --------------------------------
   */
  describe('When bill has missing optional fields', () => {

    test('Then, it should render without crashing', () => {

      const partialBill = { ...bill }

      // Suppression de champs optionnels
      delete partialBill.pct
      delete partialBill.commentAdmin

      const html = DashboardFormUI(partialBill)
      document.body.innerHTML = html

      // Vérifie que le rendu fonctionne toujours
      expect(screen.getByText(partialBill.name)).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Date invalide
   * --------------------------------
   */
  describe('When bill date is invalid format', () => {

    test('Then, it should display raw date string', () => {

      const badDateBill = { ...bill, date: "not-a-date" }

      const html = DashboardFormUI(badDateBill)
      document.body.innerHTML = html

      // Vérifie que la date brute est affichée
      expect(screen.getByText("not-a-date")).toBeTruthy()
    })
  })

});
