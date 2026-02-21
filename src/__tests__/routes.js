/**
 * @jest-environment jsdom
 */

// Router & constantes
import { ROUTES, ROUTES_PATH } from "../constants/routes"

// Helper Testing Library
import { screen } from "@testing-library/dom"


/**
 * ===============================
 * VARIABLES MOCKÉES
 * ===============================
 * Simulent l’état global transmis au router
 */
const data = []
const loading = false
const error = null


/**
 * ===============================
 * TESTS – ROUTER
 * ===============================
 */
describe('Given I am connected and I am on some page of the app', () => {

  /**
   * --------------------------------
   * Navigation → Login
   * --------------------------------
   */
  describe('When I navigate to Login page', () => {

    test('Then, it should render Login page', () => {

      // Définit la route cible
      const pathname = ROUTES_PATH['Login']

      // Génère le HTML via le router
      const html = ROUTES({
        pathname,
        data,
        loading,
        error
      })

      // Injecte dans le DOM
      document.body.innerHTML = html

      // Vérifie présence d’un texte clé de LoginUI
      expect(screen.getAllByText('Administration')).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Navigation → Bills
   * --------------------------------
   */
  describe('When I navigate to Bills page', () => {

    test('Then, it should render Bills page', () => {

      const pathname = ROUTES_PATH['Bills']

      const html = ROUTES({
        pathname,
        data,
        loading,
        error
      })

      document.body.innerHTML = html

      // Vérifie rendu BillsUI
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Navigation → NewBill
   * --------------------------------
   */
  describe('When I navigate to NewBill page', () => {

    test('Then, it should render NewBill page', () => {

      const pathname = ROUTES_PATH['NewBill']

      const html = ROUTES({
        pathname,
        data,
        loading,
        error
      })

      document.body.innerHTML = html

      // Vérifie rendu NewBillUI
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Navigation → Dashboard
   * --------------------------------
   */
  describe('When I navigate to Dashboard', () => {

    test('Then, it should render Dashboard page', () => {

      const pathname = ROUTES_PATH['Dashboard']

      const html = ROUTES({
        pathname,
        data,
        loading,
        error
      })

      document.body.innerHTML = html

      // Vérifie rendu DashboardUI
      expect(screen.getAllByText('Validations')).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Navigation → Route inconnue
   * --------------------------------
   */
  describe('When I navigate to anywhere else other than Login, Bills, NewBill, Dashboard', () => {

    test('Then, it should render Loginpage', () => {

      // Route inexistante
      const pathname = '/anywhere-else'

      const html = ROUTES({
        pathname,
        data,
        loading,
        error
      })

      document.body.innerHTML = html

      /**
       * Comportement attendu :
       * fallback → Login page
       */
      expect(screen.getAllByText('Administration')).toBeTruthy()
    })
  })

})
