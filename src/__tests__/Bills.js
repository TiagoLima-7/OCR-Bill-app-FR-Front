/**
 * @jest-environment jsdom
 */

// Import des helpers de Testing Library
import { screen, waitFor } from "@testing-library/dom"

// Vue HTML de la page Bills
import BillsUI from "../views/BillsUI.js"

// Jeu de données mocké
import { bills } from "../fixtures/bills.js"

// Container (logique métier)
import Bills from "../containers/Bills.js"

// Constantes de routing
import { ROUTES_PATH } from "../constants/routes.js"

// Mock du localStorage
import { localStorageMock } from "../__mocks__/localStorage.js"

// Fonctions de formatage
import { formatDate } from "../app/format.js"

// Router principal
import router from "../app/Router.js";


/**
 * ===============================
 * TESTS D’INTÉGRATION – Bills Page
 * ===============================
 */
describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      // Mock du localStorage navigateur
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      // Simulation utilisateur connecté
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Création du root DOM attendu par le router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // Initialisation du router
      router()

      // Navigation vers la page Bills
      window.onNavigate(ROUTES_PATH.Bills)

      // Attente du rendu de l’icône
      await waitFor(() => screen.getByTestId('icon-window'))

      const windowIcon = screen.getByTestId('icon-window')

      // Vérifie que l’icône est bien active
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })


    test("Then bills should be ordered from earliest to latest", () => {

      // Rendu de la vue avec des données mockées
      document.body.innerHTML = BillsUI({ data: bills })

      // Récupération des dates affichées
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.innerHTML)

      // Fonction de tri anti-chronologique (plus récent → plus ancien)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)

      const datesSorted = [...dates].sort(antiChrono)

      // Vérifie que l’ordre affiché correspond au tri attendu
      expect(dates).toEqual(datesSorted)
    })


    test("show charging page if loading is true", () => {

      // Vue en état de chargement
      document.body.innerHTML = BillsUI({ data: [], loading: true, error: null })

      // Vérifie l’affichage du loader
      expect(screen.getByText(/Loading.../i)).toBeTruthy()
    })


    test("Show error page if there's un error", () => {

      // Vue en état d’erreur
      document.body.innerHTML = BillsUI({ data: [], loading: false, error: "Erreur" })

      // Vérifie l’affichage du message d’erreur
      expect(screen.getAllByText(/Erreur/i)).toBeTruthy()
    })


    test("Show empty body if data is empty", () => {

      // Vue avec aucune donnée
      document.body.innerHTML = BillsUI({ data: [], loading: false, error: null })

      const tbody = screen.getByTestId("tbody")

      // Vérifie que le tableau est vide
      expect(tbody.innerHTML.trim()).toBe("");
    })


    test("Affiche correctement des notes de frais même avec dates manquantes ou mal formattées", () => {

      // Bills avec dates invalides
      const badBills = [
        { type: "Transports", name: "Taxi", date: "", amount: 20, status: "pending", fileUrl: "url" },
        { type: "Hôtel", name: "Novotel", date: "32/13/2017", amount: 100, status: "accepted", fileUrl: "url" }
      ];

      document.body.innerHTML = BillsUI({ data: badBills, loading: false, error: null });

      const rows = screen.getAllByRole("row");

      // Vérifie que les lignes sont rendues malgré les erreurs
      expect(rows.length).toBeGreaterThan(1); // header + lignes
      expect(screen.getByText("Transports")).toBeTruthy();
      expect(screen.getByText("Hôtel")).toBeTruthy();
    });

  });
});


/**
 * ===============================
 * TESTS UNITAIRES – Bills Container
 * ===============================
 */
describe("Bills container", () => {

  /**
   * Mock jQuery global
   * Nécessaire car Logout.js / modal utilisent $
   */
  beforeEach(() => {
    global.$ = jest.fn((selector) => {
      return {
        click: jest.fn(),
        modal: jest.fn(),
        on: jest.fn(),
        width: jest.fn(() => 200),
        find: jest.fn(() => ({ html: jest.fn() })),
        html: jest.fn()
      }
    })
  })


  test("getBills retourne les données formatées et gère erreurs", async () => {

    // Store mocké simulant une API
    const fakeStore = {
      bills: () => ({
        list: () => Promise.resolve([
          { id: 1, date: "2023-05-10", status: "pending" },
          { id: 2, date: "corrupt", status: "refused" }
        ])
      })
    };

    // Instance du container
    const instance = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: fakeStore,
      localStorage: window.localStorage
    });

    const billsData = await instance.getBills();

    // Vérifie le formatage des dates
    expect(billsData[0].date).toBe(formatDate("2023-05-10"))

    // Date corrompue conservée
    expect(billsData[1].date).toBe("corrupt")

    // Vérifie le formatage des statuts
    expect(billsData[0].status).toBe("En attente")
    expect(billsData[1].status).toBe("Refused")
  })


  test("handleClickNewBill déclenche la navigation vers NewBill", () => {

    const onNavigate = jest.fn();

    const instance = new Bills({
      document: document,
      onNavigate,
      store: null,
      localStorage: window.localStorage
    });

    // Action utilisateur
    instance.handleClickNewBill();

    // Vérifie la navigation
    expect(onNavigate).toHaveBeenCalledWith("#employee/bill/new");
  })


  test("constructor does not throw an error even if buttons are not present", () => {

    // DOM minimal sans boutons
    document.body.innerHTML = `<div></div>`

    expect(() => {
      new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage
      })
    }).not.toThrow()
  })


  test("handleClickIconEye opens the modal with the correct image", () => {

    // DOM simulant la modale + icône œil
    document.body.innerHTML = `
      <div id="modaleFile" style="width: 200px; display: block;">
        <div class="modal-body"></div>
      </div>
      <div data-testid="icon-eye" data-bill-url="http://image.test/img.png"></div>
    `

    const instance = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: null,
      localStorage: window.localStorage
    })

    // Mock ciblé jQuery
    global.$ = jest.fn((selector) => {
      if (selector === "#modaleFile") {
        return {
          width: () => 200,
          find: jest.fn(() => ({
            html: jest.fn(),
          })),
          modal: jest.fn(),
        };
      }
      return {
        html: jest.fn(),
        modal: jest.fn(),
        find: jest.fn(),
      };
    });

    const icon = document.querySelector('[data-testid="icon-eye"]');

    // Action
    instance.handleClickIconEye(icon);

    // Vérifie que la modale est appelée
    expect(global.$).toHaveBeenCalledWith('#modaleFile');
  })


  test("getBills gère store null", async () => {

    const instance = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: null,
      localStorage: window.localStorage
    });

    const result = await instance.getBills();

    // Aucun store → aucune donnée
    expect(result).toBeUndefined();
  })


  test("getBills gère erreur dans map", async () => {

    const fakeStore = {
      bills: () => ({
        list: () => Promise.resolve([
          { id: 1, date: "bad_date", status: "accepted" }
        ])
      })
    };

    const instance = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: fakeStore,
      localStorage: window.localStorage
    });

    const bills = await instance.getBills();

    // Vérifie que même en cas d’erreur de formatage, la structure reste valide
    expect(bills.length).toBe(1);
    expect(bills[0]).toHaveProperty("date")
    expect(bills[0]).toHaveProperty("status")
  })

});
