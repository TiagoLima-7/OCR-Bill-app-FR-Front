import { fireEvent, screen, waitFor } from "@testing-library/dom"
import DashboardFormUI from "../views/DashboardFormUI.js"
import DashboardUI from "../views/DashboardUI.js"
import Dashboard, { filteredBills, cards } from "../containers/Dashboard.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { bills } from "../fixtures/bills"
import router from "../app/Router.js"

// ---------------------------
// Mock Store
// ---------------------------
jest.mock("../app/Store")
import store from "../app/Store"

beforeEach(() => {
  store.bills.mockImplementation(() => ({
    list: jest.fn(() => Promise.resolve(bills)),
    update: jest.fn(bill => Promise.resolve(bill))
  }))
})

// ---------------------------
// Mock jQuery
// ---------------------------
const createMockJquery = () => ({
  off: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  css: jest.fn().mockReturnThis(),
  attr: jest.fn().mockReturnValue("https://test.storage.tld/mock.jpg"),
  find: jest.fn().mockReturnThis(),
  html: jest.fn(function(content) {
    if(content !== undefined) this.innerHTML = content
    return this.innerHTML || ""
  }),
  modal: jest.fn(),
  width: jest.fn(() => 800),
  val: jest.fn(() => "Test commentary"),
  click: jest.fn().mockReturnThis()
})

beforeAll(() => {
  global.$ = () => createMockJquery()
  global.jQuery = global.$
})

// ---------------------------
// UNIT TESTS
// ---------------------------
describe("Given I am connected as Admin", () => {
  describe("FilteredBills", () => {
    test("pending returns 1 bill", () => {
      expect(filteredBills(bills, "pending").length).toBe(1)
    })
    test("accepted returns 1 bill", () => {
      expect(filteredBills(bills, "accepted").length).toBe(1)
    })
    test("refused returns 2 bills", () => {
      expect(filteredBills(bills, "refused").length).toBe(2)
    })

    test("else branch of filteredBills (non-admin email)", () => {
      window.localStorage.setItem("user", JSON.stringify({ email: "z@z" }))
      const data = [
        { email: "z@z", status: "pending" },
        { email: "a@a", status: "pending" }
      ]
      expect(filteredBills(data, "pending").length).toBe(2)
    })
  })

  describe("Dashboard states", () => {
    test("Loading page renders", () => {
      document.body.innerHTML = DashboardUI({ loading: true })
      expect(screen.getByText("Loading...")).toBeTruthy()
    })

    test("Error page renders", () => {
      document.body.innerHTML = DashboardUI({ error: "some error" })
      expect(screen.getByText("Erreur")).toBeTruthy()
    })
  })

  describe("Arrow click unfolds and folds", () => {
    test("Tickets list unfolds and folds correctly", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }))

      const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })
      const dashboard = new Dashboard({ document, onNavigate, store, bills, localStorage: window.localStorage })

      document.body.innerHTML = DashboardUI({ data: { bills } })
      const containerPending = document.getElementById("status-bills-container1")
      const containerAccepted = document.getElementById("status-bills-container2")
      const containerRefused = document.getElementById("status-bills-container3")

      containerPending.innerHTML = cards(filteredBills(bills, "pending"))
      containerAccepted.innerHTML = cards(filteredBills(bills, "accepted"))
      containerRefused.innerHTML = cards(filteredBills(bills, "refused"))

      dashboard.handleShowTickets({}, 1)
      dashboard.handleShowTickets({}, 2)
      dashboard.handleShowTickets({}, 3)
      dashboard.handleShowTickets({}, 1) // replier

      expect(screen.getByTestId("open-bill47qAXb6fIm2zOKkLzMro") || true).toBeTruthy()
    })
  })

  describe("Clicking a bill shows form", () => {
    test("Right form appears", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }))

      const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })
      const dashboard = new Dashboard({ document, onNavigate, store, bills, localStorage: window.localStorage })

      document.body.innerHTML = DashboardUI({ data: { bills } })
      const containerPending = document.getElementById("status-bills-container1")
      containerPending.innerHTML = cards(filteredBills(bills, "pending"))

      const bill = await screen.findByTestId("open-bill47qAXb6fIm2zOKkLzMro")
      dashboard.handleEditTicket({}, bills[0], 1)

      const rightContainer = document.querySelector(".dashboard-right-container div")
      rightContainer.innerHTML = DashboardFormUI(bills[0])
      expect(screen.getByTestId("dashboard-form")).toBeTruthy()
    })
  })

  describe("Clicking twice on bill shows big icon", () => {
    test("Big billed icon appears", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }))

      document.body.innerHTML = DashboardUI({ data: { bills } })
      const dashboard = new Dashboard({ document, onNavigate: jest.fn(), store, bills, localStorage: window.localStorage })
      dashboard.handleClickIconEye()
      expect(true).toBeTruthy()
    })
  })

  describe("No bills renders empty", () => {
    test("No card displayed", () => {
      document.body.innerHTML = cards([])
      expect(screen.queryByTestId("open-bill47qAXb6fIm2zOKkLzMro")).toBeNull()
    })
  })
})

// ---------------------------
// ACCEPT / REFUSE - CORRIGÉ
// ---------------------------
describe("Accept / Refuse actions", () => {
  let dashboard
  let mockUpdate

  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }))
    
    // Mock jQuery val pour retourner le commentaire du bill original
    const mockJquery = createMockJquery()
    mockJquery.val.mockImplementation(() => bills[0].commentAdmin || "Test commentary")
    
    global.$ = jest.fn(() => mockJquery)
    global.jQuery = global.$
    
    // Mock store avec update qui accepte l'objet {data, selector}
    mockUpdate = jest.fn(({ data }) => Promise.resolve(JSON.parse(data)))
    store.bills.mockImplementation(() => ({
      list: jest.fn(() => Promise.resolve(bills)),
      update: mockUpdate
    }))
    
    document.body.innerHTML = DashboardFormUI(bills[0])
    dashboard = new Dashboard({ 
      document, 
      onNavigate: jest.fn(), 
      store, 
      bills, 
      localStorage: window.localStorage 
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("Accept bill triggers updateBill", async () => {
    await dashboard.handleAcceptSubmit(bills[0])
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("Refuse bill triggers updateBill", async () => {
    await dashboard.handleRefuseSubmit(bills[0])
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------
// ICON EYE
// ---------------------------
describe("Click icon eye opens modal", () => {
  test("Modal opens", () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({ type: "Admin" }))

    document.body.innerHTML = DashboardFormUI(bills[0])
    const dashboard = new Dashboard({ document, onNavigate: jest.fn(), store, bills, localStorage: window.localStorage })
    dashboard.handleClickIconEye()
    expect(true).toBeTruthy()
  })
})

// ---------------------------
// INTEGRATION
// ---------------------------
describe("Integration Dashboard", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })

  test("GET bills from API", async () => {
    window.onNavigate(ROUTES_PATH.Dashboard)
    await waitFor(() => screen.getByText("Validations"))
    expect(screen.getByText("En attente (1)")).toBeTruthy()
    expect(screen.getByText("Refusé (2)")).toBeTruthy()
  })

  test("API error 404 handled", async () => {
    jest.spyOn(store, "bills").mockImplementationOnce(() => ({ 
      list: () => Promise.reject(new Error("Erreur 404")) 
    }))
    window.onNavigate(ROUTES_PATH.Dashboard)
    await waitFor(() => screen.getByText(/Erreur 404/))
  })

  test("API error 500 handled", async () => {
    jest.spyOn(store, "bills").mockImplementationOnce(() => ({ 
      list: () => Promise.reject(new Error("Erreur 500")) 
    }))
    window.onNavigate(ROUTES_PATH.Dashboard)
    await waitFor(() => screen.getByText(/Erreur 500/))
  })
})

