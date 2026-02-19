/**
 * @jest-environment jsdom
 */

// Helper Testing Library
import { screen } from "@testing-library/dom"

// Vue ErrorPage
import ErrorPage from "../views/ErrorPage.js"


/**
 * ===============================
 * TESTS – ErrorPage
 * ===============================
 */

describe('Given I am connected on app (as an Employee or an HR admin)', () => {

  /**
   * --------------------------------
   * Appel sans message d’erreur
   * --------------------------------
   */
  describe('When ErrorPage is called without an error in its signature', () => {

    test('Then, it should render ErrorPage with no error message', () => {

      // Génération HTML sans paramètre
      const html = ErrorPage()
      document.body.innerHTML = html

      // Vérifie présence du titre générique
      expect(screen.getAllByText('Erreur')).toBeTruthy()

      // Vérifie que le message est vide
      const message = screen.getByTestId('error-message')
      expect(message.innerHTML.trim().length).toBe(0)
    })
  })


  /**
   * --------------------------------
   * Appel avec message d’erreur
   * --------------------------------
   */
  describe('When ErrorPage is called with an error message in its signature', () => {

    test('Then, it should render ErrorPage with its error message', () => {

      const error = 'Erreur de connexion internet'

      // Génération HTML avec message
      const html = ErrorPage(error)
      document.body.innerHTML = html

      // Vérifie affichage du message fourni
      expect(screen.getAllByText(error)).toBeTruthy()
    })
  })

})
