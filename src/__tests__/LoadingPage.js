/**
 * @jest-environment jsdom
 */

// Helper Testing Library
import { screen } from "@testing-library/dom"

// Vue LoadingPage
import LoadingPage from "../views/LoadingPage.js"


/**
 * ===============================
 * TESTS – LoadingPage
 * ===============================
 */

describe('Given I am connected on app (as an Employee or an HR admin)', () => {

  /**
   * --------------------------------
   * Appel de LoadingPage
   * --------------------------------
   */
  describe('When LoadingPage is called', () => {

    test('Then, it should render Loading...', () => {

      // Génération du HTML
      const html = LoadingPage()
      document.body.innerHTML = html

      // Vérifie affichage du texte de chargement
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

})
