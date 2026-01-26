/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate } from "../app/format.js"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1) //tri du plus recent au plus ancien
      // const chrono = (a, b) => ((a > b) ? 1 : -1)     //tri du plus ancien au plus recent
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("show charging page if loading is true", () => {
      document.body.innerHTML = BillsUI({ data: [], loading: true, error: null})
      expect(screen.getByText(/Loading.../i)).toBeTruthy()
    })

    test("Show error page if there's un error", () => {
      document.body.innerHTML = BillsUI({ data: [], loading: false, error: "Erreur" })
      expect(screen.getAllByText(/Erreur/i)).toBeTruthy()
    })

    test("Show empty body if data is empty", () => {
      document.body.innerHTML = BillsUI({ data: [], loading: false, error: null })
      const tbody = screen.getByTestId("tbody")
      expect(tbody.innerHTML.trim()).toBe("");
    })

    test("Affiche correctement des notes de frais même avec dates manquantes ou mal formattées", () => {
      const badBills = [
        { type: "Transports", name: "Taxi", date: "", amount: 20, status: "pending", fileUrl: "url" },
        { type: "Hôtel", name: "Novotel", date: "32/13/2017", amount: 100, status: "accepted", fileUrl: "url" }
      ];
      document.body.innerHTML = BillsUI({ data: badBills, loading: false, error: null });
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1); // header + 2 lignes
      expect(screen.getByText("Transports")).toBeTruthy();
      expect(screen.getByText("Hôtel")).toBeTruthy();
    });
  });
});

describe("Bills container", () => {

  //pour eviter les erreurs venant de Logout.js qui utilise jQuery($)
  beforeEach(() => {
    global.$ = jest.fn((selector) => {
      //retourne un objet minimal contenant les méthodes utilisés par Logout/handleClickIconEye
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
    const fakeStore = {
      bills: () => ({
        list: () => Promise.resolve([
          { id: 1, date: "2023-05-10", status: "pending" },
          { id: 2, date: "corrupt", status: "refused" }
        ])
      })
    };

    const mockFormatDate = jest.fn(d => {
      if (d === "corrupt") return d;
    });
    const mockFormatStatus = jest.fn(s => `Status: ${s}`);

    const instance = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: fakeStore,
      localStorage: window.localStorage
    });

    jest.mock("../app/format.js", () => ({
      formatDate: mockFormatDate,
      formatStatus: mockFormatStatus
    }));

    const billsData = await instance.getBills();
    // expect(billsData[0].date).toBe("2023-05-10");
    expect(billsData[0].date).toBe(formatDate("2023-05-10"));
    expect(billsData[1].date).toBe("corrupt");
    expect(billsData[0].status).toBe("En attente");
    expect(billsData[1].status).toBe("Refused");
  });

  test("handleClickNewBill déclenche la navigation vers NewBill", () => {
    const onNavigate = jest.fn();
    const instance = new Bills({
      document: document,
      onNavigate,
      store: null,
      localStorage: window.localStorage
    });
    instance.handleClickNewBill();
    expect(onNavigate).toHaveBeenCalledWith("#employee/bill/new");
  });

  test("constructor does not throw an error even if buttons are not present", () => {
    document.body.innerHTML = `<div></div>` //pas de buttons dans le DOM
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
    document.body.innerHTML= `
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
    // // Mock jQuery
    // global.$ = jest.fn((selector) => {
    //   if (selector === '#modaleFile') {
    //     return {
    //       width: () => 200,
    //       find: jest.fn(() => ({
    //         html: jest.fn()
    //       })),
    //       modal: jest.fn()
    //     };
    //   }
    //   if (selector === ".modal-body") {
    //     return {
    //       html: jest.fn()
    //     };
    //   }
    //   return {
    //     html: jest.fn(),
    //     modal: jest.fn(),
    //     find: jest.fn()
    //   };
    // });
    
    // Mock jQuery functions used in handleClickIconEye
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
    instance.handleClickIconEye(icon);

    expect(global.$).toHaveBeenCalledWith('#modaleFile');
  });

  test("getBills gère store null", async () => {
    const instance = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: null,
      localStorage: window.localStorage
    });
    const result = await instance.getBills();
    expect(result).toBeUndefined();
  });

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

    // Mock formatDate pour lancer une erreur
    jest.mock("../app/format.js", () => ({
      formatDate: () => { throw new Error("Error formatDate"); },
      formatStatus: status => status
    }));

    const bills = await instance.getBills();
    expect(bills.length).toBe(1);
    expect(bills[0]).toHaveProperty("date")
    expect(bills[0]).toHaveProperty("status")
  });
});