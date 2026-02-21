/**
 * @jest-environment jsdom
 */

// Helpers Testing Library
import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/extend-expect'

// Container testé
import Logout from "../containers/Logout.js"

// Mocks
import { localStorageMock } from "../__mocks__/localStorage.js"

// UI / Vues
import DashboardUI from "../views/DashboardUI.js"

// Routes
import { ROUTES } from "../constants/routes"


/**
 * ===============================
 * DATA MOCKÉE
 * ===============================
 * Simule une facture affichée dans le Dashboard
 */
const bills = [{
  id: "47qAXb6fIm2zOKkLzMro",
  vat: "80",
  fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  status: "pending",
  type: "Hôtel et logement",
  commentary: "séminaire billed",
  name: "encore",
  fileName: "preview-facture-free-201801-pdf-1.jpg",
  date: "2004-04-04",
  amount: 400,
  commentAdmin: "ok",
  email: "a@a",
  pct: 20,
}]


/**
 * ===============================
 * TESTS – Logout
 * ===============================
 */
describe('Given I am connected', () => {

  /**
   * --------------------------------
   * Action utilisateur : Déconnexion
   * --------------------------------
   */
  describe('When I click on disconnect button', () => {

    test('Then, I should be sent to login page', () => {

      /**
       * Mock de navigation :
       * remplace dynamiquement le body par la route demandée
       */
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      /**
       * Injection du mock localStorage
       */
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })

      /**
       * Simule un utilisateur Admin connecté
       */
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      /**
       * Affiche le Dashboard avec des bills mockées
       */
      document.body.innerHTML = DashboardUI({ bills })

      /**
       * Instanciation du container Logout
       */
      const logout = new Logout({
        document,
        onNavigate,
        localStorage
      })

      /**
       * Spy sur la méthode handleClick
       */
      const handleClick = jest.fn(logout.handleClick)

      /**
       * Récupération du bouton de déconnexion
       */
      const disco = screen.getByTestId('layout-disconnect')

      /**
       * Attache le listener click
       */
      disco.addEventListener('click', handleClick)

      /**
       * Simule le clic utilisateur
       */
      userEvent.click(disco)

      /**
       * Vérifications
       */

      // Le handler est déclenché
      expect(handleClick).toHaveBeenCalled()

      // Vérifie que la page attendue est affichée
      expect(screen.getByText('Administration')).toBeTruthy()
    })
  })
})
