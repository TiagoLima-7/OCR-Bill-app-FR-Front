/**
 * ===============================
 * @jest-environment jsdom
 * ===============================
 * Tests pour le composant VerticalLayout
 * Vérifie que les icônes sont correctement rendues pour un employé
 */

import { screen } from "@testing-library/dom"
import VerticalLayout from "../views/VerticalLayout"
import { localStorageMock } from "../__mocks__/localStorage.js"


describe('Given I am connected as Employee', () => {

  /**
   * --------------------------------
   * Vérifie que les icônes de la barre verticale sont présentes
   * --------------------------------
   */
  test("Then Icons should be rendered", () => {
    // Mock de localStorage pour simuler un utilisateur connecté
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    const user = JSON.stringify({
      type: 'Employee'
    })
    window.localStorage.setItem('user', user)

    // Rendu du composant VerticalLayout avec une hauteur arbitraire
    const html = VerticalLayout(120)
    document.body.innerHTML = html

    // Vérifie que les icônes spécifiques sont présentes dans le DOM
    expect(screen.getByTestId('icon-window')).toBeTruthy()
    expect(screen.getByTestId('icon-mail')).toBeTruthy()
  })

})
